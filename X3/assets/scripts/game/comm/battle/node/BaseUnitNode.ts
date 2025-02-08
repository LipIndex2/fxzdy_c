import { Layers, Node } from "cc";

export class BaseUnitNode extends Node {
    constructor(name?:string){
        super(name);
        //this.layer = Layers.Enum.DEFAULT;
    }
}