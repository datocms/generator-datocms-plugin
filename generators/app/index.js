var Generator = require('yeoman-generator');
var changeCase = require('change-case');

module.exports = class extends Generator {
  async prompting() {
    this.answers = await this.prompt([
      {
        type    : 'confirm',
        name    : 'confirm',
        message : 'Hi! I am your plugin-generator! I will generate for you a standard package.json and README file to make the creation of your DatoCMS plugin super-easy and fast. \n At the end remember to add in the docs folder a cover image that will be displayed on the plugin section of DatoCMS site and a preview image or gif of what your plugin will look like :) \n Let\'s start, shall we?',
      },
      {
        type    : 'input',
        name    : 'packageName',
        message : 'NPM package name',
        default : `datocms-plugin-${changeCase.paramCase(this.appname)}`,
        validate: function( value ) {
          if (value.startsWith('datocms-plugin')) {
            return true;
          } else {
            return "You should add datocms-plugin prefix";
          }
        }
      },
      {
        type    : 'input',
        name    : 'pluginTitle',
        message : 'Plugin title',
      },
      {
        type    : 'input',
        name    : 'description',
        message : 'Plugin description'
      },
      {
        type    : 'list',
        name    : 'pluginType',
        message : 'Plugin type (https://www.datocms.com/docs/plugins/introduction/#types-of-plugins)',
        choices: [
          { name: 'Field editor', value: 'field_editor' },
          { name: 'Field add-on', value: 'field_addon' },
          { name: 'Sidebar widget', value: 'sidebar' }
        ]
      },
      {
        type    : 'input',
        name    : 'keywords',
        message : 'Plugin keywords (comma separated)',
      },
      {
        type    : 'input',
        name    : 'authorName',
        message : 'Your name',
      },
      {
        type    : 'input',
        name    : 'authorEmail',
        message : 'Your email',

      },
      {
        type    : 'checkbox',
        name    : 'fieldTypes',
        message : 'Plugin type (https://www.datocms.com/docs/plugins/introduction/#field-types)',
        choices:
        [
          { name:'Boolean', value: 'boolean' },
          { name:'Date', value: 'date' },
          { name:'Date_time', value: 'date_time' },
          { name:'Float', value: 'float' },
          { name:'Integer', value: 'integer' },
          { name:'String', value: 'string' },
          { name:'Text', value: 'text' },
          { name:'Json', value: 'json' },
          { name:'Color', value: 'color' },
        ]
      }
    ]);
  }

  writing() {
    this.log('cool feature', this.answers.name);
    const {
      packageName,
      pluginTitle,
      description,
      authorName,
      authorEmail,
      keywords,
      fieldTypes
    } = this.answers;

    this.fs.copy(
      this.templatePath('static/**/*'),
      this.destinationRoot(),
      { globOptions: { dot: true } }
    );

    this.fs.copyTpl(
      this.templatePath('package.json'),
      this.destinationPath('package.json'),
      {
        packageName,
        pluginTitle,
        description,
        authorName,
        authorEmail,
        fieldTypes,
        keywords: keywords.split(',').concat(
          [
            "datocms",
            "datocms-plugin"
          ]
        )
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
  }
};
