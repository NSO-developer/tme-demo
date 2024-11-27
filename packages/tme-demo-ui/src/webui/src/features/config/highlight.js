import 'highlight.js/styles/github.css';

import hljs from 'highlight.js';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
import cli from './languages/cli';
import cb from './languages/curly-braces';

export function registerLanguages() {
  hljs.registerLanguage('json', json);
  hljs.registerLanguage('xml', xml);
  hljs.registerLanguage('yaml', yaml);
  hljs.registerLanguage('cli', cli);
  hljs.registerLanguage('curly-braces', cb);
}
