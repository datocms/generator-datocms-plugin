var Generator = require('yeoman-generator');

module.exports = class extends Generator {
  async prompting() {
    const answers = await this.prompt([
      {
        type    : 'input',
        name    : 'name',
        message : 'Your plugin name',
        default : this.appname
      },
      {
        type    : 'confirm',
        name    : 'cool',
        message : 'Would you like to enable the Cool feature?'
      }
    ]);

    this.log('app name', answers.name);
    this.log('cool feature', answers.cool);
  }

  method1() {
    this.log('method 1 just ran');
  }
};
