export interface IndexingStatusForCurrentVersion {
    synced: boolean;
    health: string;
    chains?: (ChainsEntity)[] | null;
}
export interface ChainsEntity {
    chainHeadBlock: ChainHeadBlockOrLatestBlock;
    latestBlock: ChainHeadBlockOrLatestBlock;
}
export interface ChainHeadBlockOrLatestBlock {
    number: string;
}
  