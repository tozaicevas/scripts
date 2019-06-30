const PUBLIC_CLASS_REGEX = /^\s*public\s+class\s+(\w+)/;
const PRIVATE_FIELD_REGEX = /^\s*private\s+\w+\s+(\w+).*;$/;
const PUBLIC_METHOD_REGEX = /^\s*public\s+\w+\s+(\w+)\(.*\)/;
const BUILDER_REGEX = /class\s+.*Builder/;
const checkForPublicClass = line => line.match(PUBLIC_CLASS_REGEX);
const checkForPrivateField = line => line.match(PRIVATE_FIELD_REGEX);
const checkForPublicMethod = line => line.match(PUBLIC_METHOD_REGEX);
const checkForBuilderClass = line => line.match(BUILDER_REGEX);

const classesInfo = [];

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

const checkForEqualsMethod = methodNames => {
    const EQUALS_REGEX = /^equals$/;
    return methodNames.find(name => name.match(EQUALS_REGEX)) ? true : false;
}

const analyzeFile = (err, content, next) => {
    if (err) throw err;
    const FIRST_MATCH = 1;
    const LINE_END_REGEX = /\r?\n/;
    const lines = content.split(LINE_END_REGEX);
    let className;
    const privateFields = [];
    const publicMethods = [];
    let isBuilderPresent = false;
    lines.forEach(line => {
        let result;
        if (result = checkForPublicClass(line))
            className = result[FIRST_MATCH];
        else if (result = checkForPrivateField(line))
            privateFields.push(result[FIRST_MATCH]);
        else if (result = checkForPublicMethod(line))
            publicMethods.push(result[FIRST_MATCH]);
        else
            isBuilderPresent = isBuilderPresent || (checkForBuilderClass(line) ? true : false);
    });
    const gettersCount = getNumberOfGetters(publicMethods);
    const settersCount = getNumberOfSetters(publicMethods);
    const containsToString = checkForToStringMethod(publicMethods);
    const containsEqualsMethod = checkForEqualsMethod(publicMethods);
    const allMethodsArePojo = (gettersCount + settersCount + containsToString.valueOf()) === publicMethods.length;
    const allFieldsHaveGettersAndSetters = privateFields.length === gettersCount;
    const isPojo = (gettersCount === settersCount) && allMethodsArePojo && allFieldsHaveGettersAndSetters;
    console.log(`///--- ${className}.java ---///`);
    if (isBuilderPresent)
        console.log("Builder present\n");
    else
        console.log(`POJO: ${isPojo}\n`);

    const classInfo = {
        name: className,
        isPojo,
        gettersCount,
        settersCount,
        containsToString,
        containsEqualsMethod,
        isBuilderPresent
    };
    classesInfo.push(classInfo);
    next();
};

const finishAnalyzingFiles = (err, files) => {
    if (err) throw err;
    const pojosCounter = classesInfo.filter(classInfo => classInfo.isPojo).length;
    const builderCounter = classesInfo.filter(classInfo => classInfo.isBuilderPresent).length;
    const getters = classesInfo.filter(classInfo => classInfo.isPojo)
        .reduce((prevValue, currValue) => currValue.gettersCount + prevValue, 0);
    const setters = classesInfo.filter(classInfo => classInfo.isPojo)
        .reduce((prevValue, currValue) => currValue.settersCount + prevValue, 0);
    const toStringMethodsCount = classesInfo.filter(classInfo => classInfo.containsToString).length;
    const equalsMethodsCount = classesInfo.filter(classInfo => classInfo.containsEqualsMethod).length;
    console.log(`${files.length} classes`);
    console.log(`${pojosCounter} pojos`);
    console.log(`${builderCounter} builders`);
    console.log(`${getters} getters`);
    console.log(`${setters} setters`);
    console.log(`${toStringMethodsCount} toString() methods`);
    console.log(`${equalsMethodsCount} equals() methods`);
}

const dir = require('node-dir');
dir.readFiles(__dirname, {
    exclude: ['node_modules', 'test'],
    match: /.java$/
}, analyzeFile, finishAnalyzingFiles);