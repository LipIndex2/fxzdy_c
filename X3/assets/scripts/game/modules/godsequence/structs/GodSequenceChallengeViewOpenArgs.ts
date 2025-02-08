export class GodSequenceChallengeViewOpenArgs {
    
    type: number;
    layerNum: number;

    static create(type: number, layerNum: number) {
        const args = new GodSequenceChallengeViewOpenArgs();
        args.type = type;
        args.layerNum = layerNum;
        return args;
    }
}