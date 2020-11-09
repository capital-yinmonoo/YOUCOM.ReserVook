export class WebReserveInfo
{
  frDScRcvBase: FrDScRcvBaseInfo;
  frDScRcvAgentIf: FrDScRcvAgentIfInfo;
  frDScRcvMemberIf: FrDScRcvMemberIfInfo;
  frDScRcvOptIf: FrDScRcvOptIfInfo[];
  frDScRcvPntIf: FrDScRcvPntIfInfo[];
  frDScRcvRmIf: FrDScRcvRmIfInfo[];
  frDScRcvRmRtIf: FrDScRcvRmRtIfInfo[];
  frDScRcvXml: FrDScRcvXmlInfo;
  frDScRcvRpBase: FrDScRcvRpBaseInfo;
  frDScRcvRpRmIf: FrDScRcvRpRmIfInfo[];
  frDScRcvRpRmRtIf: FrDScRcvRpRmRtIfInfo[];
}

export class FrDScRcvBaseInfo
{
  companyNo:string;
  scCd: string;

  scRcvSeq :number;

  xDataFr:string;
  xDataClsfic:string;
  xDataId:string;
  xSystemDate:string;
  xSystemTime:string;

  xAccmArea:string;
  xAccmNm:string;
  xAccmCd:string;
  xChainNm:string;
  xAccmPrsnInChg:string;
  xAccmEmail:string;
  xAccmPhnNum:string;
  xSalesOfcCompanyCd:string;
  xSalesOfcCompanyNm:string;
  xSalesOfcNm:string;
  xSalesOfcCd:string;
  xSalesOfcPrsnInChg:string;
  xSalesOfcEmail:string;
  xSalesOfcPhnNum:string;
  xSalesOfcStatePrvdnc:string;
  xSalesOfcCityNm:string;
  xSalesOfcAddressLine:string;
  xSalesOfcStreetNum:string;
  xSalesOfcPostCd:string;
  xRetailerCompanyNm:string;
  xTravelAgncBkngNum:string;
  xTravelAgncBkngDate:string;
  xTravelAgncBkngTime:string;
  xTravelAgncReportNum:string;

  xGstOrGpNmSnglBt:string;
  xGstOrGpNmDoubleBt:string;
  xGstOrGpNmKanjiNm:string;

  xCheckInDate:string;
  xCheckInTime:string;
  xCheckOutDate:string;
  xCheckOutTime:string;
  xNights:number;
  xTrnsprt:string;

  xTtlRmCnt:number;
  xGrandTtlPaxCnt:number;

  xTtlPaxMaleCnt :number;
  xTtlPaxFemaleCnt :number;
  xTtlChildA70Cnt :number;
  xTtlChildB50Cnt :number;
  xTtlChildC30Cnt :number;
  xTtlCchildDNoneCnt :number;
  xTtlChildENoneCnt :number;
  xTtlChildFNoneCnt :number;
  xTtlCchildOtherCnt :number;

  xTypeOfGp:string;
  xStatus:string;
  xPackageType:string;
  xPackagePlanNm:string;
  xPackagePlanCd:string;
  xPackagePlanContent:string;

  xMealCond:string;
  xSpecMealCond:string;
  xMealPlace:string;
  xModPnt:string;
  xCancellationNum:string;
  xSpecialSrvcReq:string;
  xOtherSrvcIfrm:string;
  xOtherSrvcIfrm2:string;
  xFollowUpIfrm:string;

  xTravelAgncEmail:string;
  xRmrtOrprsnalrt:string;
  xTaxSrvcFee:string;
  xPayment:string;
  xBareNetRt:number;
  xCreditCardAuthority:string;
  xCreditCardNum:string;

  xTtlAccmChg :number;
  xTtlAccmCnsmptTax :number;
  xTtlAccmHotsprTax :number;
  xTtlAccmSrvcFee :number;
  xTtlAccmOtherFee :number;
  xCmmsnPercentage :number;
  xTtlAccmCmmsnAmnt :number;

  onlineDate:string;
  batchDate:string;
  reservationNo:string;
  checkoutDate:string;

  scRcvRmIfCntr :number;
  scRcvOptIfCntr :number;
  scRcvMemberCntr :number;
  scRcvPntCntr :number;
  scRcvDepositCntr :number;
  scRcvAgentCntr :number;

  scProcessedCd:string;
  scProcessedMessage:string;
  xDataId2:number;
  xDataClsficOdr:string;

  updateCnt:number;

  programId:string;
  createClerkCd:string;
  createMachineNo:string;
  createMachine:string;
  createDatetime:string;
  updateClerkCd:string;
  updateMachineNo:string;
  updateMachine:string;
  updateDatetime:string;

  type: string;
  typeColor: string;
  checkInTimeDisplay: string;
  checkOutTimeDisplay: string;
  totalPoint: number;
}

export class FrDScRcvAgentIfInfo
{
  companyNo:string;
  scCd: string;

  scRcvSeq :number;
  scRcvAgentSeq :number;
  xTravelAgncBkngNum :string;

  xPntDiv :string;
  xPntNm :string;
  xPnts :number;
  xTtlAccmDeclPnts :number;
  xTtlAccmCnsmptTax :number;
  xAmntClaimed :number;

  xVipCd :string;
  xAgoRsvNum :string;
  xFrRsvNum :string;
  xTodayReserve: string;

  xTtlMaleCnt :number;
  xTtlFemaleCnt :number;

  xSettlementDiv: string;
  xCancellationChg: string;
  xCancellationNotice: string;

  reservationNo :string;
  checkoutDate :string;

  updateCnt:number;

  programId:string;
  createClerkCd:string;
  createMachineNo:string;
  createMachine:string;
  createDatetime:string;
  updateClerkCd:string;
  updateMachineNo:string;
  updateMachine:string;
  updateDatetime:string;

  pntDivDisplay: string;
}

export class FrDScRcvMemberIfInfo
{
  companyNo:string;
  scCd: string;

  scRcvSeq :number;
  scRcvMemberSeq :number;
  xTravelAgncBkngNum :string;

  xUsrNm :string;
  xUsrKana :string;
  xUsrTel :string;
  xUsrMailAddr :string;
  xUsrZip :string;
  xUsrAddr :string;
  xPntNm :string;
  xUsrCorp :string;
  xUsrDep :string;
  xUsrId :string;

  xUsrGivingPnts :number;
  xUsrUsePnts :number;

  xUsrType :string;
  xUsrDateOfBirth :string;
  xUsrGendar :string;
  xUsrEmergencyPhnNum: string;
  xUsrOccupation :string;
  xUsrMailMgznFrAccm :string;
  xUsrPost :string;
  xUsrOfcAddr: string;
  xUsrOfcPhn :string;
  xUsrTtlPnt :number;
  xUsrCorpId :string;
  xUsrCorpKana: string;
  xMemberOfcPostCd: string;

  xGstReq: string;
  xAdditionalIfrm: string;
  xTtlAccmSrvcChg: number;
  xTtlAccmDeclPnts: number;
  xAmntClaimed: number;

  reservationNo :string;
  checkoutDate :string;

  updateCnt:number;

  programId:string;
  createClerkCd:string;
  createMachineNo:string;
  createMachine:string;
  createDatetime:string;
  updateClerkCd:string;
  updateMachineNo:string;
  updateMachine:string;
  updateDatetime:string;
}

export class FrDScRcvOptIfInfo
{
  companyNo:string;
  scCd: string;

  scRcvSeq :number;
  scRcvOptIfSeq :number;
  xTravelAgncBkngNum :string;

  xOptDate :string;
  xNm :string;
  xNmReq :string;
  xOptCnt :number;
  xOptRt :number;
  xOptCd :string;

  reservationNo :string;
  checkoutDate :string;

  updateCnt:number;

  programId:string;
  createClerkCd:string;
  createMachineNo:string;
  createMachine:string;
  createDatetime:string;
  updateClerkCd:string;
  updateMachineNo:string;
  updateMachine:string;
  updateDatetime:string;

  xOptDateDisplayYM:string;
}

export class FrDScRcvPntIfInfo
{
  companyNo:string;
  scCd: string;

  scRcvSeq :number;
  scRcvPntSeq :number;
  xTravelAgncBkngNum :string;

  xPntsDiv :number;
  xPntsDiscntNm :string;
  xPntsDiscnt :number;

  reservationNo :string;
  checkoutDate :string;

  updateCnt:number;

  programId:string;
  createClerkCd:string;
  createMachineNo:string;
  createMachine:string;
  createDatetime:string;
  updateClerkCd:string;
  updateMachineNo:string;
  updateMachine:string;
  updateDatetime:string;
}

export class FrDScRcvRmIfInfo
{
  companyNo:string;
  scCd: string;

  scRcvSeq :number;
  scRcvRmIfSeq :number;
  xTravelAgncBkngNum :string;

  xRmTypeCd :string;
  xRmTypeNm :string;
  xRmCategory :string;
  xViewType :string;
  xSmokingOrNonSmoking :string;

  xPerRmPaxCnt :number;
  xRmPaxMaleCnt :number;
  xRmPaxFemaleCnt :number;
  xRmChildA70Cnt :number;
  xRmChildB50Cnt :number;
  xRmChildC30Cnt :number;
  xRmChildDNoneCnt :number;
  xRmChildENoneCnt :number;
  xRmChildFNoneCnt :number;
  xRmChildOtherCnt :number;

  xRmByRmStatus :string;
  xFacilities :string;
  xAssignedRmNum :string;
  xRmSpecialReq :string;

  scRcvRmRtIfCntr :number;
  scRcvRmGstIfCntr :number;

  reservationNo :string;
  checkoutDate :string;

  updateCnt:number;

  programId:string;
  createClerkCd:string;
  createMachineNo:string;
  createMachine:string;
  createDatetime:string;
  updateClerkCd:string;
  updateMachineNo:string;
  updateMachine:string;
  updateDatetime:string;
}

export class FrDScRcvRmRtIfInfo
{
  companyNo:string;
  scCd: string;

  scRcvSeq :number;
  scRcvRmIfSeq :number;
  scRcvRmRtIfSeq :number;
  xTravelAgncBkngNum :string;

  xRmDate :string;
  xPerPaxRt :number;
  xPerChildA70Rt :number;
  xPerChildB50Rt :number;
  xPerChildC30Rt :number;
  xPerChildDRt :number;
  xPerChildERt :number;
  xPerChildFRt :number;
  xPerChildOtherRt :number;

  xTtlPerRmRt :number;
  xTtlPerRmCnsmptTax :number;
  xTtlRmHotsprTax :number;
  xTtlPerRmSrvcFee :number;

  scRmDateGstListCntr :number;

  reservationNo :string;
  checkoutDate :string;

  updateCnt:number;

  programId:string;
  createClerkCd:string;
  createMachineNo:string;
  createMachine:string;
  createDatetime:string;
  updateClerkCd:string;
  updateMachineNo:string;
  updateMachine:string;
  updateDatetime:string;
}

export class FrDScRcvXmlInfo
{
  companyNo:string;
  scCd: string;

  scRcvSeq :number;
  xTravelAgncBkngNum :string;

  scRcvXml :string;
  scRcvFileNm :string;

  reservationNo :string;
  checkoutDate :string;

  updateCnt:number;

  programId:string;
  createClerkCd:string;
  createMachineNo:string;
  createMachine:string;
  createDatetime:string;
  updateClerkCd:string;
  updateMachineNo:string;
  updateMachine:string;
  updateDatetime:string;
}

export class FrDScRcvRpBaseInfo
{
  companyNo:string;
  scCd: string;

  scRcvSeq :number;
  xTravelAgncBkngNum:string;

  xTelegramData:string;
  xTelegramData2:string;

  xPhnNum: string;
  xEmail: string;
  xPostCd: string;
  xAddress: string;
  xTtlPaxManCnt: number;
  xBranchFaxNum: string;
  xVer: string;
  xRprsnttvMiddleNm: string;
  xRprsnttvPhnType: string;
  xRprsnttvAge: string;
  xRprsnttvCellularPhn: string;
  xRprsnttvOfficialPhn: string;
  xRprsnttvGeneration: string;
  xRprsnttvGendar: string;

  xAccmId: string;
  xAssignDiv: string;
  xGenderDiv: string;
  xHandleDiv: string;
  xRsvUsrDiv: string;
  xUseDiv: string;

  scRcvRpRmIfCntr: number;

  reservationNo:string;
  checkoutDate:string;

  updateCnt:number;

  programId:string;
  createClerkCd:string;
  createMachineNo:string;
  createMachine:string;
  createDatetime:string;
  updateClerkCd:string;
  updateMachineNo:string;
  updateMachine:string;
  updateDatetime:string;
}

export class FrDScRcvRpRmIfInfo
{
  companyNo:string;
  scCd: string;

  scRcvSeq :number;
  scRcvRpRmIfSeq :number;
  xTravelAgncBkngNum :string;

  xRmTypeCd :string;
  xRmTypeNm :string;
  xRmCategory :string;
  xViewType :string;
  xSmokingOrNonSmoking :string;

  xPerRmPaxCnt :number;
  xRmPaxMaleCnt :number;
  xRmPaxFemaleCnt :number;
  xRmChildA70Cnt :number;
  xRmChildB50Cnt :number;
  xRmChildC30Cnt :number;
  xRmChildDNoneCnt :number;

  xFacilities :string;
  xAssignedRmNum :string;
  xRmSpecialReq :string;

  xRmPaxMaleReq :number;
  xRmPaxFemaleReq :number;
  xRmChildAReq :number;
  xRmChildBReq :number;
  xRmChildDNoneReq :number;

  xRmTypeAgent :string;
  xRmFrame :string;
  xNetRmTypeGpCd :string;
  xPlanGpCd :string;
  xRprsnttvPrsnNm :string;

  scRcvRpRmRtIfCntr :number;
  scRcvRpRmGstIfCntr :number;

  reservationNo :string;
  checkoutDate :string;

  updateCnt:number;

  programId:string;
  createClerkCd:string;
  createMachineNo:string;
  createMachine:string;
  createDatetime:string;
  updateClerkCd:string;
  updateMachineNo:string;
  updateMachine:string;
  updateDatetime:string;

  xRmDateDisplayMD:string;
}

export class FrDScRcvRpRmRtIfInfo
{
  companyNo:string;
  scCd: string;

  scRcvSeq :number;
  scRcvRpRmIfSeq :number;
  scRcvRpRmRtIfSeq :number;
  xTravelAgncBkngNum :string;

  xRmDate :string;

  xPerPaxRt :number;
  xPerChildA70Rt :number;
  xPerChildB50Rt :number;
  xPerChildC30Rt :number;
  xPerChildDRt :number;

  xTtlPerRmRt :number;
  xTtlPerRmCnsmptTax :number;
  xTtlRmHotsprTax :number;
  xTtlPerRmSrvcFee :number;

  xPerMaleRt :number;
  xPerFemaleRt :number;
  xRmRtPaxMaleCnt :number;
  xRmRtPaxFemaleCnt :number;
  xRmRtChildA70Cnt :number;
  xRmRtChildB50Cnt :number;
  xRmRtChildC30Cnt :number;
  xRmRtChildDNoneCnt :number;

  xRmRtPaxMaleReq :string;
  xRmRtPaxFemaleReq :string;
  xRmRtChildA70Req :string;
  xRmRtChildB50Req :string;
  xRmRtChildC30Req :string;
  xRmRtChildDNoneReq :string;

  reservationNo :string;
  checkoutDate :string;

  updateCnt:number;

  programId:string;
  createClerkCd:string;
  createMachineNo:string;
  createMachine:string;
  createDatetime:string;
  updateClerkCd:string;
  updateMachineNo:string;
  updateMachine:string;
  updateDatetime:string;

  xRmDateDisplayMD:string;
}
