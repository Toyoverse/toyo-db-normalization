import { request, gql } from 'graphql-request';

export class OnchainRepository {

    onChain = process.env.THEGRAPH_URL;

    async getTokenSwappedEntitiesByWalletAndTokenId(tokenId: string): Promise<any>{
        const query = gql`
        {
            tokenOwnerEntities(
            first: 500
            where: {tokenId: "${tokenId}"}
          ) {
            typeId,
            transactionHash,
            tokenId,
            currentOwner,
            currentStaker,
            isStaked
            }
        }
        `;
        const data: any = await request(
            this.onChain,
            query,
          );
      
          return data.tokenOwnerEntities;
    }
}