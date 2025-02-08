import { fsm } from "../../../../core/fsm/FSM";
import { GuardShipFSMState } from "../const/GuardShipFSMEnum";

export class GuardShipEndState extends fsm.State {
    public name: string = GuardShipFSMState.End;
}