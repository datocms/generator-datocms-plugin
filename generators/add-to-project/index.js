const Generator = require('yeoman-generator');
const { AccountClient, SiteClient } = require('datocms-client');
const fs = require('fs');

const oauthToken = require('../../utils/oauthToken');

const required = (value) => {
  if (value) {
    return true;
  }
return 'Please insert some value!';
};

module.exports = class extends Generator {
  async prompting() {
    await this.prompt([
      {
        type    : 'confirm',
        name    : 'foo',
        message : 'In order to add this plugin to one of your projects we need you to sign in to DatoCMS. We\'ll open up a browser whenever you\'re ready!',
        validate: required,
      }
    ]);

    const credentials = await oauthToken();
    const accountClient = new AccountClient(credentials.accessToken);
    const sites = await accountClient.sites.all({}, { allPages: true });

    this.answers = await this.prompt([
      {
        type:       'list',
          name:     'site',
          message:  'On which project you would like to add this plugin in development mode?',
          choices:  sites.map(site => ({ name: site.name, value: site })),
          validate: required,
      }
    ]);
  }

  async writing() {
    const { site } = this.answers;

    const client = new SiteClient(site.readwriteToken);
    const pkg = JSON.parse(fs.readFileSync(this.destinationPath('package.json')));

    this.plugin = await client.plugins.create({
      name: pkg.datoCmsPlugin.title,
      description: pkg.description,
      fieldTypes: pkg.datoCmsPlugin.fieldTypes,
      pluginType: pkg.datoCmsPlugin.pluginType,
      parameterDefinitions: pkg.datoCmsPlugin.parameters,
      url: `https://${pkg.name}.localtunnel.me/`,
    });
  }

  end() {
    const { site } = this.answers;

    this.log(`The plugin has been installed in development mode on the "${site.name}" project: https://${site.internalSubdomain}.admin.datocms.com/admin/plugins/${this.plugin.id}/edit`);
  }
};
