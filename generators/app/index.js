const Generator = require('yeoman-generator');
const changeCase = require('change-case');
const { AccountClient, SiteClient } = require('datocms-client');

const oauthToken = require('../../utils/oauthToken');

const required = (value) => {
  if (value) {
    return true;
  }

  return 'Please insert some value!';
};

const atLeastOne = (list) => {
  if (list && list.length > 0) {
    return true;
  }

  return 'Please insert some value!';
};


module.exports = class extends Generator {

  async prompting() {
    this.log();
    this.log('Hi! I am your DatoCMS plugin generator!');
    this.log('I will generate for you the structure of a Webpack project to start developing your shiny new DatoCMS plugin right away! Let\'s start, shall we? :)');

    const { packageName } = await this.prompt([
      {
        type    : 'input',
        name    : 'packageName',
        message : 'Please insert the NPM package name for this new plugin (it must start with datocms-plugin-)',
        default : `datocms-plugin-${changeCase.paramCase(this.appname)}`,
        validate: function(value) {
          if (value.startsWith('datocms-plugin-')) {
            return true;
          } else {
            return "You need to add a datocms-plugin- prefix!";
          }
        }
      }
    ]);

    this.answers = await this.prompt([
      {
        type    : 'input',
        name    : 'pluginTitle',
        message : 'Please insert a human name for this plugin',
        default: changeCase.titleCase(packageName.replace('datocms-plugin-', '')),
        validate: required,
      },
      {
        type    : 'input',
        name    : 'description',
        message : 'Please insert a small description',
        validate: required,
      },
      {
        type    : 'list',
        name    : 'pluginType',
        message : 'What kind of plugin is it? (For more info see https://www.datocms.com/docs/plugins/introduction/#types-of-plugins)',
        choices: [
          { name: 'Field editor', value: 'field_editor' },
          { name: 'Field add-on', value: 'field_addon' },
          { name: 'Sidebar widget', value: 'sidebar' }
        ],
        validate: required,
      },
      {
        type    : 'checkbox',
        name    : 'fieldTypes',
        message : 'Which kind of fields is this plugin compatible with?',
        choices:
        [
          { name: 'JSON', value: 'json' },
          { name: 'Text', value: 'text' },
          { name: 'Boolean', value: 'boolean' },
          { name: 'Float', value: 'float' },
          { name: 'Integer', value: 'integer' },
          { name: 'String', value: 'string' },
          { name: 'Multiple links', value: 'links' },
          { name: 'Single link', value: 'link' },
          { name: 'Date', value: 'date' },
          { name: 'Date-time', value: 'date_time' },
          { name: 'Video', value: 'video' },
          { name: 'Color', value: 'color' },
          { name: 'Seo', value: 'seo' },
          { name: 'Geolocation', value: 'lat_lon' },
        ],
        validate: atLeastOne,
      },
      {
        type    : 'editor',
        name    : 'parameterDefinitions',
        message : 'Please insert any configuration parameters this plugin requires (see https://www.datocms.com/docs/plugins/creating-a-new-plugin/#configuration-parameters)',
        default : JSON.stringify(
          {
            global: [
              {
                id: "developmentMode",
                label: "Development mode",
                type: "boolean",
                required: true,
                default: false,
                hint: "Shows debug messages in console",
              },
            ],
            instance: []
          },
          null,
          2
        ),
        validate: (value) => {
          try {
            const defs = JSON.parse(value);
            if (defs.instance && Array.isArray(defs.instance) && defs.global && Array.isArray(defs.global)) {
              return true;
            }
            return 'Please insert a valid JSON object';
          } catch(e) {
            return 'Not valid JSON';
          }
        },
      }
    ]);

    this.answers = Object.assign(
      { packageName },
      this.answers,
      await this.prompt([
        {
          type:     'input',
          name:     'keywords',
          message:  'Please add some tags to make the plugin more discoverable (comma separated)',
          validate: required,
          default:  [changeCase.paramCase(this.answers.pluginType)].concat(this.answers.fieldTypes.map(ft => `${changeCase.paramCase(ft)}-field` )).join(', '),
        },
        {
          type:     'input',
          name:     'homepage',
          message:  'Please add the homepage for this plugin',
          validate: required,
          default:  `https://github.com/YOUR-USER/${packageName}`
        },
        {
          type:     'input',
          name:     'authorName',
          message:  'What\'s your name?',
          validate: required,
        },
        {
          type:     'input',
          name:     'authorEmail',
          message:  'What\'s your email?',
          validate: required,
        },
        {
          type    : 'list',
          name    : 'template',
          message : 'Please select the preferred template',
          choices: [
            { name: 'Vanilla JS', value: 'vanilla' },
            { name: 'React', value: 'react' },
          ],
          validate: required,
        },
        {
          type:    'confirm',
          name:    'addToProject',
          message: 'Would you like to add this plugin in development mode to one of your projects and start developing it right away?',
        },
      ])
    );

    if (this.answers.addToProject) {
      await this.prompt([
        {
          type:     'confirm',
          name:     'foo',
          message:  'In order to add this plugin to one of your projects we need you to sign in to DatoCMS. We\'ll open up a browser whenever you\'re ready!',
          validate: required,
        }
      ]);

      const credentials = await oauthToken();
      const accountClient = new AccountClient(credentials.accessToken);
      const sites = await accountClient.sites.all({}, { allPages: true });

      const answers2 = await this.prompt([
        {
          type:     'list',
          name:     'site',
          message:  'On which project you would like to add this plugin in development mode?',
          choices:  sites.map(site => ({ name: site.name, value: site })),
          validate: required,
        }
      ]);

      this.answers.site = answers2.site;
    }
  }

  async writing() {
    const {
      packageName,
      pluginTitle,
      pluginType,
      description,
      authorName,
      parameterDefinitions,
      authorEmail,
      keywords,
      template,
      fieldTypes,
      homepage,
    } = this.answers;

    this.fs.copy(
      this.templatePath(`${template}/**/*`),
      this.destinationRoot(),
      { globOptions: { dot: true } }
    );

    this.fs.copyTpl(
      this.templatePath(`webpack.config.js.${template}`),
      this.destinationPath('webpack.config.js'),
      {
        packageName,
      }
    );

    this.fs.copyTpl(
      this.templatePath('package.json'),
      this.destinationPath('package.json'),
      {
        packageName,
        pluginTitle,
        pluginType,
        description,
        authorName,
        authorEmail,
        template,
        fieldTypes,
        homepage,
        parameterDefinitions: JSON.parse(parameterDefinitions),
        keywords: ['datocms', 'datocms-plugin'].concat(
          [changeCase.paramCase(this.answers.pluginType)],
          this.answers.fieldTypes.map(ft => `${changeCase.paramCase(ft)}-field`),
          keywords.split(/\s*,\s*/)
        ).filter((value, index, self) => self.indexOf(value) === index),
      }
    );

    this.fs.copyTpl(
      this.templatePath('README.md'),
      this.destinationPath('README.md'),
      {
        pluginTitle,
        description,
        packageName
      }
    );

    if (this.answers.site) {
      const client = new SiteClient(this.answers.site.readwriteToken);
      this.plugin = await client.plugins.create({
        name: pluginTitle,
        description: description,
        fieldTypes,
        pluginType,
        parameterDefinitions: JSON.parse(parameterDefinitions),
        url: `https://${packageName}.localtunnel.me/`,
      });
    }
  }

  install() {
    this.installDependencies({
      npm: false,
      bower: false,
      yarn: true
    });
  }

  end() {
    this.log();
    this.log(`Hurray! The plugin structure is ready! You can start the development server with the following command:`);

    this.log();
    this.log(`yarn start`);
    this.log();

    if (this.plugin) {
      this.log(`The plugin has already been installed in development mode on the "${this.answers.site.name}" project: https://${this.answers.site.internalSubdomain}.admin.datocms.com/admin/plugins/${this.plugin.id}/edit`);
      this.log(`Just open src/index.js and start developing right away!`);
    } else {
      this.log(`You can add this plugin to one of your DatoCMS projects following this guide: https://www.datocms.com/docs/plugins/creating-a-new-plugin/`);
    }

    this.log();
    this.log(`For more help on how to build plugins, take a look at our documentation! https://www.datocms.com/docs/plugins/entry-point/`);
    this.log();

    this.log(`Once you've finished developing this plugin, remember to publish it with the following command:`);

    this.log();
    this.log(`yarn publish`);
    this.log();
  }
};
