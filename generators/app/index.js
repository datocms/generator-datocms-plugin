var Generator = require('yeoman-generator');

module.exports = class extends Generator {
  async prompting() {
    const answers = await this.prompt([
      {
        type    : 'input',
        name    : 'name',
        message : 'Plugin name',
        default : this.appname
      },
      {
        type    : 'input',
        name    : 'description',
        message : 'Plugin description'
      },
      {
        type    : 'checkbox',
        name    : 'pluginType',
        message : 'Plugin type (https://www.datocms.com/docs/plugins/introduction/#types-of-plugins)',
        choices: [
          { name: 'Field editor', value: 'field_editor' },
          { name: 'Field add-on', value: 'field_addon' },
          { name: 'Sidebar widget', value: 'sidebar' }
        ]
      }
    ]);
  }

  writing() {
    this.fs.copy(
      this.templatePath('static/**/*'),
      this.destinationRoot(),
      { globOptions: { dot: true } }
    );

    this.fs.copyTpl(
      this.templatePath('package.json'),
      this.destinationPath('package.json'),
      { pluginName: this.aswers.name }
    );

    this.fs.copyTpl(
      this.templatePath('README.md'),
      this.destinationPath('README.md'),
      { pluginName: this.aswers.name }
    );
  }
};
