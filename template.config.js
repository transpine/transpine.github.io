/**
 * This file is a configuration file generated by the `Template` extension on `vscode`
 * @see https://marketplace.visualstudio.com/items?itemName=yongwoo.template
 */
module.exports = {
  // You can change the template path to another path
  templateRootPath: "./.templates",
  // After copying the template file the `replaceFileTextFn` function is executed
  replaceFileTextFn: (fileText, templateName, utils) => {
    // @see https://www.npmjs.com/package/change-case
    const { changeCase } = utils;
    // You can change the text in the file
    const datetime = new Date();
    const month = `${datetime.getMonth()+1}`.padStart(2, '0');
    const date = `${datetime.getDate()}`.padStart(2, '0');

    const hour = `${datetime.getHours()}`.padStart(2, '0');
    const min = `${datetime.getMinutes()}`.padStart(2, '0');

    const dateString = `${datetime.getFullYear()}-${month}-${date}`;
    const timeString = `${hour}:${min}`;

    return fileText
      .replace(/var_date/g, dateString )
      .replace(/var_time/g, timeString )
      .replace(/__templateName__/g, templateName)
      .replace(
        /__templateNameToPascalCase__/g,
        changeCase.pascalCase(templateName)
      )
      .replace(
        /__templateNameToParamCase__/g,
        changeCase.paramCase(templateName)
      );
  },
  renameFileFn: (fileName, templateName, utils) => {
    const { path } = utils;
    const { base } = path.parse(fileName);

    return base.replace(/__templateName__/gm, templateName);
  },
  renameSubDirectoriesFn: (directoryName, templateName, _utils) => {
    const { changeCase } = _utils;
    const newDirectoryName = changeCase.paramCase(templateName);
    return directoryName.replace(/__templateName__/g, newDirectoryName);
  },
};
