import { request, gql } from "graphql-request";

export class OnchainRepository {
  onChain = process.env.THEGRAPH_URL;

  async getTokenOwnerEntityByTokenId(tokenId: string): Promise<any> {
    const query = gql`
        {
            tokenOwnerEntities(
            first: 1
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
    const data: any = await request(this.onChain, query);

    return data.tokenOwnerEntities;
  }
}
