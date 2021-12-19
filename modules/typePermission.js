class pageType {
    constructor (name) {
        this.name = name;
    }

    static get modelName() {
        return 'page';
    }
}

module.exports = { pageType };