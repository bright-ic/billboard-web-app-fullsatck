import HandlebarClass from 'handlebars';

class Handlebars {
    source = "";
    data = {};

    render(source:string, data:{[key: string]: any}) {
        this.source = source;
        this.data = data;

        const template = HandlebarClass.compile(this.source);

        return template(this.data);
    }
}

module.exports = Handlebars;
