export default class Shuttler<TModel>{
    model: TModel = {} as TModel;
    push: () => void;

    constructor(initialModel: TModel){
      this.writeModel(initialModel,true);
      this.push = () => this.writeModel(this.model,true);
    }

    private listeners: {(model: TModel): void; } [] = [];

    subscribe( fn: (model: TModel) => void) : () => void {
        this.listeners.push(fn);
        const unsubscribe = () => this.listeners = this.listeners.filter(singleFn => singleFn !== fn);
        return unsubscribe;
    }

    writeModel(model: TModel,forceOverwrite: boolean){
        const modelChanged = forceOverwrite || this.differentObject(this.model,model);
        if(modelChanged){
          this.model = model;
          this.listeners.map(singleFn => singleFn(model));
        }
    }

    private differentObject(oldModel: TModel, newModel: TModel) {
      return JSON.stringify(oldModel) !== JSON.stringify(newModel);
    }
}