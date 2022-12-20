import Position from "../../../shared/types/Position";

export interface IPositionService{
    isBusy:boolean;

    getOpenPositions(pageSize:number,offset:number): Promise<Position[]>
}