import Position from "../../../shared/types/Position";

export interface IPositionService{
    isBusy:boolean;

    getOpenPositions(startIndex:number,offset:number): Promise<Position[]>
    processPositions(positions:Position []) :Promise<Position[]>
}