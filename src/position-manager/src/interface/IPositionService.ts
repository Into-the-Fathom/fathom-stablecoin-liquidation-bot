import Position from "../../../shared/types/Position";

export interface IPositionService{
    isBusy:boolean;

    getRiskyPositions(pageSize:number,offset:number): Promise<Position[]>
}