export class CleaningCondition {
  companyNo: string;
  useDate: string;
}

export interface Cleaning {
    floor: string;
    roomNo: string;
    roomType: string;
    roomStatus: string;
    cleaningInstruction: string;
    cleaningRemarks: string;
    smoking: string;
    smokingName: string;
    nights: string;
    // depatureTime: string;
    // arrivalTime: string;
    man: number | null;
    woman: number | null;
    childA: number | null;
    childB: number | null;
    childC: number | null;
    memberTotal: number | null;
    // note: string;

    useDate:string
    roomChangeKey:string
    roomStateDiv:string
    roomStatusValue:number;
    dispRoomStatus:string;
    selectedRowIndex:number;

    roomStateUpdValue:string
    isStatusUpdateData:boolean

}

export namespace CleaningListColumn {

  export const Floor : string = "floor";
  export const RoomNo : string = "roomNo";
  export const RoomType : string = "roomType";
  export const Smoking : string = "smoking";
  export const RoomStatus : string = "roomStatus";
  export const Nights : string = "nights";
  export const Man : string = "man";
  export const Woman : string = "woman";
  export const ChildA : string = "childA";
  export const ChildB : string = "childB";
  export const ChildC : string = "childC";
  export const MemberTotal : string = "memberTotal";
  export const CleaningInstruction : string = "cleaningInstruction";
  export const CleaningRemarks : string = "cleaningRemarks";
  export const Register : string = "register";

}
