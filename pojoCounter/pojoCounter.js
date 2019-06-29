const PUBLIC_CLASS_REGEX = /^\s*public\s+class\s+(\w+)/;
const PRIVATE_FIELD_REGEX = /^\s*private\s+\w+\s+(\w+).*;$/;
const PUBLIC_METHOD_REGEX = /^\s*public\s+\w+\s+(\w+)\(.*\)/;
const BUILDER_REGEX = /class\s+.*Builder/;
const checkForPublicClass = line => line.match(PUBLIC_CLASS_REGEX);
const checkForPrivateField = line => line.match(PRIVATE_FIELD_REGEX);
const checkForPublicMethod = line => line.match(PUBLIC_METHOD_REGEX);
const checkForBuilderClass = line => line.match(BUILDER_REGEX);

const getNumberOfGetters = methodNames => {
    const GETTER_REGEX = /^get[A-Z]\w*/;
    return methodNames.filter(name => name.match(GETTER_REGEX)).length;
}

const getNumberOfSetters = methodNames => {
    const SETTER_REGEX = /^set[A-Z]\w*$/;
    return methodNames.filter(name => name.match(SETTER_REGEX)).length;
}

const checkForToStringMethod = methodNames => {
    const TOSTRING_REGEX = /^toString$/;
    return methodNames.find(name => name.match(TOSTRING_REGEX)) ? true : false;
}

const analyzeFile = (err, content, next) => {
    if (err) throw err;
    let className;
    const privateFields = [];
    const publicMethods = [];
    let isBuilderPresent = false;
    const LINE_END_REGEX = /\r?\n/;
    const lines = content.split(LINE_END_REGEX);
    lines.forEach(line => {
        let result;
        if (result = checkForPublicClass(line)) {
            className = result[1];
        }
        else if (result = checkForPrivateField(line))
            privateFields.push(result[1]);
        else if (result = checkForPublicMethod(line))
            publicMethods.push(result[1]);
        else
            isBuilderPresent = isBuilderPresent || (checkForBuilderClass(line) ? true : false);
    });
    const gettersCount = getNumberOfGetters(publicMethods);
    const settersCount = getNumberOfSetters(publicMethods);
    const containsToString = checkForToStringMethod(publicMethods);
    const allMethodsArePojo = (gettersCount + settersCount + containsToString.valueOf()) == publicMethods.length;
    const allFieldsHaveGettersAndSetters = privateFields.length === (gettersCount + settersCount);
    const isPojo = (gettersCount === settersCount) && allMethodsArePojo && allFieldsHaveGettersAndSetters
    console.log(`${className}.java`);
    console.log(`Getters: ${gettersCount}`);
    console.log(`Setters: ${settersCount}`);
    console.log(`toString: ${containsToString}`);
    console.log(`POJO: ${isPojo}`);
    console.log(`Builder: ${isBuilderPresent}\n`)
    next();
};

const finishAnalyzingFiles = (err, files) => {
    if (err) throw err;
    console.log('Finished analyzing classes', files);
}

const dir = require('node-dir');
dir.readFiles(__dirname, {
    exclude: ['node_modules', 'test'],
    match: /.java$/
}, analyzeFile, finishAnalyzingFiles);