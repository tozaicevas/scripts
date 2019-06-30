const PUBLIC_CLASS_REGEX = /^\s*public\s+class\s+(\w+)/;
const PRIVATE_FIELD_REGEX = /^\s*private\s+\w+\s+(\w+).*;$/;
const PUBLIC_METHOD_REGEX = /^\s*public\s+\w+\s+(\w+)\(.*\)/;
const BUILDER_REGEX = /class\s+.*Builder/;
const GETTER_REGEX = /^get[A-Z]\w*/;
const SETTER_REGEX = /^set[A-Z]\w*$/;
const FIRST_MATCH = 1;
const checkForPublicClass = line => line.match(PUBLIC_CLASS_REGEX);
const checkForPrivateField = line => line.match(PRIVATE_FIELD_REGEX);
const checkForPublicMethod = line => line.match(PUBLIC_METHOD_REGEX);
const checkForBuilderClass = line => line.match(BUILDER_REGEX);
const classesInfo = [];

const getNumberOfGetters = methodNames => methodNames.filter(name => name.match(GETTER_REGEX)).length;

const getNumberOfSetters = methodNames => methodNames.filter(name => name.match(SETTER_REGEX)).length;

const checkForToStringMethod = methodNames => {
    const TOSTRING_REGEX = /^toString$/;
    return methodNames.find(name => name.match(TOSTRING_REGEX)) ? true : false;
}

const checkForEqualsMethod = methodNames => {
    const EQUALS_REGEX = /^equals$/;
    return methodNames.find(name => name.match(EQUALS_REGEX)) ? true : false;
}

const checkForAdditionalLogic = (content, methodName) => {
    const isGetter = methodName.match(GETTER_REGEX);
    const isSetter = methodName.match(SETTER_REGEX);
    const METHOD_BODY_INDEX = 2;
    if (!isGetter && !isSetter)
        return false;
    const METHOD_BODY_REGEX = new RegExp(`${methodName}\(.*?\)\s*?{(.*?)}`, 's');
    const methodBody = content.match(METHOD_BODY_REGEX)[METHOD_BODY_INDEX];
    const SETTER_WITHOUT_ADDITIONAL_LOGIC_REGEX = /^\s*this\.\w+\s*=.*?;\s*$/;
    const GETTER_WITHOUT_ADDITIONAL_LOGIC_REGEX = /^\s*return\s\w+?;\s*$/;
    return !((methodBody.match(SETTER_WITHOUT_ADDITIONAL_LOGIC_REGEX != null) || (methodBody.match(GETTER_WITHOUT_ADDITIONAL_LOGIC_REGEX) != null)));
}

const analyzeFile = (err, content, next) => {
    if (err) throw err;
    const LINE_END_REGEX = /\r?\n/;
    const lines = content.split(LINE_END_REGEX);
    let className;
    const privateFields = [];
    const publicMethods = [];
    let isBuilderPresent = false;
    let gettersAndSettersWithAdditionalLogicCount = 0;
    lines.forEach(line => {
        let result;
        if (result = checkForPublicClass(line))
            className = result[FIRST_MATCH];
        else if (result = checkForPrivateField(line))
            privateFields.push(result[FIRST_MATCH]);
        else if (result = checkForPublicMethod(line)) {
            const methodName = result[FIRST_MATCH];
            publicMethods.push(methodName);
            if (checkForAdditionalLogic(content, methodName))
                gettersAndSettersWithAdditionalLogicCount++;
        }
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
        isBuilderPresent,
        gettersAndSettersWithAdditionalLogicCount
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
    const gettersAndSettersWithAdditionalLogicCount = classesInfo
        .reduce((prevValue, currValue) => currValue.gettersAndSettersWithAdditionalLogicCount + prevValue, 0);
    console.log(`${files.length} classes`);
    console.log(`${pojosCounter} pojos`);
    console.log(`${builderCounter} builders`);
    console.log(`${getters} getters`);
    console.log(`${setters} setters`);
    console.log(`${toStringMethodsCount} toString() methods`);
    console.log(`${equalsMethodsCount} equals() methods`);
    console.log(`${gettersAndSettersWithAdditionalLogicCount} getters/setters with additional logic`);
}

const dir = require('node-dir');
dir.readFiles(__dirname, {
    exclude: ['node_modules', 'test'],
    match: /.java$/
}, analyzeFile, finishAnalyzingFiles);