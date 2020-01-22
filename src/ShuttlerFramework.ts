import Shuttler from "shuttlerjs";

export interface IShuttlerModel<TRepository,TState,TSubmissionData>{
    repository: TRepository;
    state: TState;
    submissionData: TSubmissionData;
}

export default class ShuttlerFx<TRepository,TState,TSubmissionData> extends Shuttler<IShuttlerModel<TRepository,TState,TSubmissionData>> {
    public pushToSubmissionData(value: object){
        this.pushToObject(this.model.submissionData,value);
    }

    public pushToState(value: object){
        this.pushToObject(this.model.state,value);
    }

    public pushToRepository(value: object){
        this.pushToObject(this.model.repository,value);
    }

    private pushToObject(destinationObject: any,value: object) {
        const targetPropertyNames = Object.getOwnPropertyNames(value);
        targetPropertyNames.map(propertyName => this.writeToObject(destinationObject,propertyName,value));
        this.push();
    }

    private writeToObject(destinationObject: object,propertyName: string,sourceOject: any) {
        const value = sourceOject[propertyName];
        Reflect.set(destinationObject,propertyName,value);
    }
}