export class LostItemListInfo {
companyNo: string;
managementNo: string;
itemState: string;
itemCategory: string;
itemName: string;
foundDate: string;
foundTime: string;
foundPlace: string;
comment: string;
searchWord: string;
foundPlaceCode: string;
storageCode: string;
status: string;
version: number;
creator: string;
updator: string;
cdt: string;
udt: string;

stateName: string;
foundPlaceName: string;
storageName: string;

reserveNo: string;
roomNo: string;

udtBefore:string;
udtAfter:string;

imageContentType: string;
imageData: Uint8Array;

/** 画像表示用 */
imageSrc: string | ArrayBuffer;
}

export class LostItemPictureInfo {
  companyNo: string;
  managementNo: string;
  fileSeq: number;
  contentType: string;
  fileName: string;
  binaryData: Uint8Array;
  status: string;
  version: number;
  creator: string;
  updator: string;
  cdt: string;
  udt: string;

  imageSrc: string | ArrayBuffer;


  imageInfo: LostItemPictureInfo[];
}
