import { EnsPublicClient, createEnsPublicClient } from "@ensdomains/ensjs";
import {
  CredentialTemplate,
  DentityEnsClient,
  VerifiableCredentialPresentation,
} from "@dentity/ens-client";
import { http } from "viem";
import { mainnet } from "viem/chains";

class Verifications {
  private static instance: Verifications;

  private _client: EnsPublicClient;

  private constructor() {
    // Private constructor to prevent direct instantiation

    this._client = createEnsPublicClient({
      chain: mainnet,
      // Configure your faucet url here
      transport: http(),
    }) as EnsPublicClient;
  }

  public static getInstance(): Verifications {
    if (!Verifications.instance) {
      Verifications.instance = new Verifications();
    }
    return Verifications.instance;
  }

  public async getDentityVerifications(
    ensName: string
  ): Promise<VerifiableCredentialPresentation[]> {
    const ensClient = await DentityEnsClient.initialize(
      this._client as any,
      ensName
    );

    // Get ethereum address
    const address = ensClient.getEthAddress();
    console.log("ENS Address:", address);

    const verifications = await ensClient.getVerifications();
    console.log("verifications:", verifications);

    //const validationResult = await DentityEnsClient.verifyVerification(verification);

    return verifications;
  }
}

export default Verifications;
