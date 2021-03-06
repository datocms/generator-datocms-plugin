const Generator = require("yeoman-generator");
const { AccountClient, SiteClient } = require("datocms-client");
const fs = require("fs");

const oauthToken = require("../../utils/oauthToken");

const required = value => {
  if (value) {
    return true;
  }
  return "Please insert some value!";
};

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.argument("projectToken", { type: String, required: false });
  }

  async prompting() {
    if (!this.options.projectToken) {
      await this.prompt([
        {
          type: "confirm",
          name: "foo",
          message:
            "No project API Token specified: in order to add this plugin to one of your projects we need you to sign in to DatoCMS. We'll open up a browser whenever you're ready!",
          validate: required
        }
      ]);

      const credentials = await oauthToken();
      const accountClient = new AccountClient(credentials.accessToken);
      const account = await accountClient.account.find();
      const sites = await accountClient.sites.all({}, { allPages: true });

      this.answers = await this.prompt([
        {
          type: "list",
          name: "site",
          message:
            "On which project you would like to add this plugin in development mode?",
          choices: sites
            .filter(site => site.owner === account.id)
            .map(site => ({ name: site.name, value: site })),
          validate: required
        }
      ]);
    }
  }

  async writing() {
    const token = this.options.projectToken || this.answers.site.readwriteToken;

    const client = new SiteClient(token);

    const pkg = JSON.parse(
      fs.readFileSync(this.destinationPath("package.json"))
    );

    this.plugin = await client.plugins.create({
      name: pkg.datoCmsPlugin.title,
      description: pkg.description,
      fieldTypes: pkg.datoCmsPlugin.fieldTypes,
      pluginType: pkg.datoCmsPlugin.pluginType,
      parameterDefinitions: pkg.datoCmsPlugin.parameters,
      url: `http://localhost:5000/`
    });
  }

  end() {
    const { site } = this.answers;

    this.log(
      `The plugin has been installed in development mode on the "${site.name}" project: https://${site.internalSubdomain}.admin.datocms.com/admin/plugins/${this.plugin.id}/edit`
    );
  }
};
