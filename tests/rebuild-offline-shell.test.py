"""Layout-only publication remains safe with a sparse checkout."""
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('rebuild_shell', Path(__file__).resolve().parents[1] / 'scripts/rebuild-offline-shell.py')
shell_builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(shell_builder)


class ShellRebuildTests(unittest.TestCase):
    def fixture(self, root):
        files = {
            'index.html': '<link rel="stylesheet" href="./gre-learning/storybook.css"><script type="module">import("./gre-learning/app.js")</script>',
            'gre-learning/storybook.css': '@import "./tablet.css";',
            'gre-learning/tablet.css': '.reading-scroll{overflow:auto}',
            'gre-learning/app.js': 'import "./reading-scroll.js";',
            'gre-learning/reading-scroll.js': 'export const tablet=true;',
            'gre-learning/offline-preferences.js': "export const OFFLINE_EDITION='204-offline3500-v60';",
            'gre-learning/update.js': "const build = '204-offline3500-v60';",
            'gre-learning/offline-control.js': 'export function control(){}\n',
            'gre-learning/hosted-media.js': 'export const HOSTED=[];\n',
            'sw.js': "const BUILD='204-offline3500-v60';\nconst SHELL_ASSETS = [];\n",
        }
        assets = []
        for path, data in files.items():
            file = root / path
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_text(data)
            if path not in ['sw.js', 'gre-learning/tablet.css', 'gre-learning/reading-scroll.js']:
                assets.append(shell_builder.digest_record(path, data.encode()))
        missing = {'url': 'gre-learning/units/not-checked-out.json', 'sha256': 'a' * 64, 'bytes': 120}
        assets.append(missing)
        (root / 'gre-learning/shell-manifest.json').write_text(json.dumps({'build': '204-offline3500-v60', 'assets': assets}))
        records = [{'path': asset['url'], 'loading': 'shell', 'bytes': asset['bytes'], 'sha256': asset['sha256']} for asset in assets]
        records.append({'path': 'gre-learning/story-media/not-checked-out.mp4', 'loading': 'on-demand', 'bytes': 10000, 'sha256': 'b' * 64, 'gzipBytes': 9950})
        manifest = {'releaseBuild': '204-offline3500-v60', 'assets': records, 'availablePairedLessons': 401,
                    'availableTextLessons': 3500, 'retainedHistoricalAssets': 212, 'totals': {'bytes': sum(a['bytes'] for a in records), 'gzipBytes': 9950}}
        (root / 'asset-manifest.json').write_text(json.dumps(manifest))
        return manifest, missing

    def test_sparse_rebuild_preserves_content_and_finds_new_shell_dependencies(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            original, missing = self.fixture(root)
            result = shell_builder.rebuild(root, '204-offline3500-v61')
            shell = json.loads((root / 'gre-learning/shell-manifest.json').read_text())
            assets = {asset['url']: asset for asset in shell['assets']}
            self.assertEqual(assets[missing['url']], missing)
            for path in ['gre-learning/tablet.css', 'gre-learning/reading-scroll.js']:
                self.assertEqual(assets[path]['sha256'], hashlib.sha256((root / path).read_bytes()).hexdigest())
            manifest = json.loads((root / 'asset-manifest.json').read_text())
            for key in ['availablePairedLessons', 'availableTextLessons', 'retainedHistoricalAssets']:
                self.assertEqual(manifest[key], original[key])
            self.assertEqual(next(a for a in manifest['assets'] if a['path'].endswith('.mp4')), original['assets'][-1])
            self.assertIn('204-offline3500-v61', (root / 'gre-learning/update.js').read_text())
            self.assertIn('204-offline3500-v61', (root / 'gre-learning/offline-preferences.js').read_text())
            self.assertIn('204-offline3500-v61', (root / 'sw.js').read_text())
            self.assertEqual(result['retainedAbsentAssets'], 2)

    def test_dry_run_does_not_write_and_default_build_does_not_downgrade(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            self.fixture(root)
            before = {path.relative_to(root): path.read_bytes() for path in root.rglob('*') if path.is_file()}
            result = shell_builder.rebuild(root, dry_run=True)
            after = {path.relative_to(root): path.read_bytes() for path in root.rglob('*') if path.is_file()}
            self.assertEqual(before, after)
            self.assertEqual(result['build'], '204-offline3500-v60')


if __name__ == '__main__':
    unittest.main()
