"""Local-mode regression tests; no HTTP listener or external network required."""
import asyncio
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
import main

class LocalModeTests(unittest.TestCase):
    def test_no_updater_routes(self):
        paths = {route.path for route in main.app.routes}
        for path in ['/api/check-update', '/api/update-from-github', '/api/update-rollback',
                     '/api/update-backups', '/api/update-connectivity', '/api/update-connectivity/probe']:
            self.assertNotIn(path, paths)
        self.assertFalse(main.app_info()['update_check_enabled'])

    def test_no_default_providers(self):
        self.assertEqual(main.default_api_providers(), [])
        self.assertEqual(main.merge_default_api_providers([]), [])
        self.assertIsNone(main.load_static_runninghub_provider())
        self.assertEqual(main.MODELSCOPE_DEFAULT_LORAS, [])
        with tempfile.TemporaryDirectory() as folder, patch.object(main, 'DATA_DIR', folder), patch.object(main, 'API_PROVIDERS_FILE', str(Path(folder) / 'providers.json')):
            self.assertEqual(main.load_api_providers(), [])
            result = asyncio.run(main.save_providers([]))
            self.assertEqual(result['providers'], [])
            self.assertEqual(main.load_api_providers(), [])
            custom = {'id': 'local-api', 'name': 'Local', 'base_url': 'http://localhost:8000/v1', 'chat_models': ['mine']}
            main.save_api_providers([custom])
            providers = main.load_api_providers()
            self.assertEqual([p['id'] for p in providers], ['local-api'])
            self.assertEqual(providers[0]['chat_models'], ['mine'])
            with self.assertRaises(main.HTTPException):
                main.get_api_provider('removed-vendor')

    def test_upload_requires_explicit_destination(self):
        with patch.dict(main.os.environ, {}, clear=True):
            for fn in [main.upload_video_to_litterbox, main.upload_video_to_temp_sh]:
                with self.assertRaises(main.HTTPException) as error:
                    asyncio.run(fn('/missing-file', '/assets/example.mp4'))
                self.assertEqual(error.exception.status_code, 400)

if __name__ == '__main__':
    unittest.main()
