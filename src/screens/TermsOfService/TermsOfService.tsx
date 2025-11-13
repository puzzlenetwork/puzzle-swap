import React from "react";
import styled from "@emotion/styled";
import { Column } from "@components/Flex";
import SizedBox from "@components/SizedBox";
import { usePageTitle } from "@src/usePageTitle";

const Root = styled(Column)`
  width: 100%;
  max-width: 1160px;
  padding: 40px 16px;
  box-sizing: border-box;
  align-items: flex-start;
`;

const ContentWrapper = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: 32px;
  box-sizing: border-box;

  h1 {
    font-size: 32px;
    font-weight: 600;
    line-height: 40px;
    margin: 0 0 24px 0;
    color: ${({ theme }) => theme.colors.primary800};
  }

  h2 {
    font-size: 24px;
    font-weight: 600;
    line-height: 32px;
    margin: 32px 0 16px 0;
    color: ${({ theme }) => theme.colors.primary800};
  }

  h3 {
    font-size: 20px;
    font-weight: 600;
    line-height: 28px;
    margin: 24px 0 12px 0;
    color: ${({ theme }) => theme.colors.primary800};
  }

  p {
    font-size: 16px;
    line-height: 24px;
    margin: 12px 0;
    color: ${({ theme }) => theme.colors.primary650};
  }

  ul, ol {
    margin: 12px 0;
    padding-left: 24px;

    li {
      font-size: 16px;
      line-height: 24px;
      margin: 8px 0;
      color: ${({ theme }) => theme.colors.primary650};
    }
  }

  a {
    color: ${({ theme }) => theme.colors.blue500};
    text-decoration: underline;

    &:hover {
      color: ${({ theme }) => theme.colors.blue500};
      opacity: 0.8;
    }
  }

  strong {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary800};
  }
`;

const TermsOfService: React.FC = () => {
  usePageTitle();

  return (
    <Root>
      <ContentWrapper>
        <h1>TERMS OF USE</h1>

        <p>
          The following terms of use (Terms, Terms of Use or Agreement) govern your use (the term "Use" will mean any access, downloading, reproduction, installing, copying, playing, demonstrating and/or other use, as applicable) of our Puzzle Network software developed by Puzzle DAO (either in the form of desktop software, Web or mobile-version) (Software or Software platform or Puzzle Network or puzzlenetwork or puzzle.network) and related services enabling you to issue, manage, transfer, burn, lease, and exchange tokens within the Waves blockchain and exchange other tokens for the tokens compatible with the Waves blockchain, and other related features, tools, materials and services made on the Software platform by third parties (Services).
        </p>

        <p>
          Puzzle DAO is not a financial organization or a bank and is currently not under the supervision of any monetary supervisory authority. Therefore, your deposited crypto assets are not protected by any public authorities, including but not limited, state insurance corporations or agencies.
        </p>

        <p>
          Please read these Terms of Use carefully before using the Software platform and related Services. These Terms of Use form a binding agreement between Puzzle DAO (Company, us, we) and you as the User.
        </p>

        <p>
          The terms you or the User refers to any person or entity browsing, accessing, downloading, reproducing, installing, copying, playing, demonstrating and/or otherwise using the Services, or receiving any Services. A copy of these Terms of Use may be downloaded, saved and printed for your reference.
        </p>

        <p>
          Specific terms (if applicable) always take precedence over these Terms. Specific terms may be accessed via the links to external resources.
        </p>

        <p>
          <strong>BY ACCESSING AND USING THE SOFTWARE AND THE SERVICES, YOU ACCEPT AND AGREE TO BE BOUND BY AND COMPLY WITH THESE TERMS OF USE. IF YOU DO NOT ACCEPT AND AGREE TO BE BOUND BY THESE TERMS OF USE, PLEASE DO NOT ACCESS, OR USE THE WX NETWORK.</strong>
        </p>

        <p>
          <strong>THE SOFTWARE PLATFORM BELIEVES THAT THE INFORMATION PRESENTED IS ACCURATE AND THAT THE INFORMATION WAS OBTAINED FROM SOURCES THAT THE SOFTWARE PLATFORM BELIEVES TO BE RELIABLE. HOWEVER, THE SOFTWARE PLATFORM DOES NOT GUARANTEE THE ACCURACY OR COMPLETENESS OF THE INFORMATION. SUCH INFORMATION IS SUBJECT TO CHANGE WITHOUT NOTICE.</strong>
        </p>

        <p>
          <strong>DECISIONS TO USE, HOLD, TRANSFER, TRADE OR MAKE OTHER TRANSACTIONS WITH CRYPTO-ASSETS INVOLVE A HIGH DEGREE OF RISK AND ARE BEST MADE BASED ON THE ADVICE OF QUALIFIED FINANCIAL PROFESSIONALS. ANY DEALING WITH CRYPTOCURRENCIES AND OTHER CRYPTO-ASSETS INVOLVES A RISK OF SUBSTANTIAL LOSSES. THEREFORE, BEFORE UNDERTAKING ANY ACTION AND USING WX NETWORK SOFTWARE AND SERVICES, YOU SHOULD CONSULT A QUALIFIED PROFESSIONAL. PLEASE CONSIDER CAREFULLY WHETHER SUCH TRADING IS SUITABLE FOR YOU IN LIGHT OF YOUR FINANCIAL CONDITION AND ABILITY TO BEAR FINANCIAL RISKS. UNDER NO CIRCUMSTANCES SHALL WE BE LIABLE FOR ANY LOSS OR DAMAGE YOU OR ANYONE ELSE INCURS AS A RESULT OF ANY CRYPTOTRANSFER AND/OR EXCHANGE OR INVESTMENT ACTIVITY THAT YOU OR ANYONE ELSE ENGAGES THROUGH OUR SOFTWARE AND/OR SERVICES.</strong>
        </p>

        <p>
          <strong>THE SOFTWARE PLATFORM IS NOT RESPONSIBLE FOR PREVENTING OR MANAGING INFORMATION BROADCASTED ON A BLOCKCHAIN.</strong>
        </p>

        <p>
          The most current version of the Terms of Use will be provided at <a href="https://puzzle.network/terms_and_conditions" target="_blank" rel="noreferrer">https://puzzle.network/terms_and_conditions</a>. If an amendment is essential, as determined by the sole discretion of the Software platform, the Software platform will notify you by providing the notice, which can be published at Puzzle Network's website <a href="https://puzzle.network/" target="_blank" rel="noreferrer">https://puzzle.network/</a> (Website). Changes will be effective no sooner than the day they are publicly posted. If you do not want to agree to any changes made to the Terms of Use, you should stop using the Software and/or related Services because by continuing to use the Software and/or related Services, you indicate your Agreement to be bound by the updated terms.
        </p>

        <p>
          The Software platform may, from time to time, set up and/or change the terms and limits to the provided Software and Services. The Software platform reserves the right at any time and in its sole discretion to suspend and/or cancel the provision of the Services or Software for any users for their violation of the present Terms and/or otherwise at the Software platform's own discretion. The Software platform may terminate the provision of Services or Software in part or in full at any time.
        </p>

        <h2>1. ELIGIBILITY</h2>

        <p>
          You may not use our Website, Software, and related services if you are a citizen, resident, inhabitant, or legal entity incorporated in Restricted Use Areas as described below.
        </p>

        <p>By using the Software and Services, you confirm that:</p>
        <ul>
          <li>You are at least 18 (eighteen) years old;</li>
          <li>You are of legal age to accept this Agreement according to your residence country legislation;</li>
          <li>You comply with the laws and regulations of your country of residence;</li>
          <li>you have a full capacity and authority to enter into this Agreement;</li>
          <li>You have a valid User address or will create a valid User address for using Puzzle Network.</li>
          <li>You are not a citizen or resident of the United States of America (U.S.)</li>
        </ul>

        <p>If you are using the Services on behalf of a legal entity, you represent and warrant that:</p>
        <ol type="a">
          <li>Such legal entity is duly organized and validly existing under the applicable laws of the jurisdiction of its organization.</li>
          <li>You are duly authorized by such legal entity to act on its behalf.</li>
          <li>Any beneficial owner of the legal entity, director, employee, service provider, or any other individual in any way connected with your Software platform has not been placed on any of the sanctions lists published and maintained by the United Nations, European Union, any EU country, UK Treasury, and US Office of Foreign Assets Control (OFAC).</li>
        </ol>

        <h2>2. PUZZLE NETWORK SERVICES</h2>

        <p>
          Puzzle Network is a decentralized multi-purpose DeFi ecosystem built on the Waves blockchain, enabling users to access a full range of decentralized financial instruments through a unified interface ("Interface"). Puzzle Network provides users with the tools to swap, stake, lend, borrow, and manage digital assets within the Waves blockchain, as well as to participate in DAO governance and NFT trading.
        </p>

        <h3>Puzzle Swap</h3>

        <p>
          Puzzle Swap is a decentralized exchange (DEX) aggregator designed for the interchange and trading of cryptocurrencies, tokens, and other digital assets within the Puzzle blockchain ecosystem. The Software provides Users with access to a decentralized liquidity aggregation mechanism that automatically sources the most efficient trading routes across available liquidity pools.
        </p>

        <p>
          All transactions executed through Puzzle Swap are performed directly on-chain, via smart contracts deployed on the Puzzle blockchain. The Software does not act as a custodian and does not hold Users' assets or private keys at any point. Users maintain full control of their funds before, during, and after transactions.
        </p>

        <p>
          The Software utilizes automated market-making (AMM) mechanisms and price aggregation algorithms to enable token exchanges. Users acknowledge and accept that prices, slippage, and transaction outcomes are determined by smart contract logic and network conditions at the time of execution.
        </p>

        <p>
          The Software may use third-party oracles or external price data sources to assist in determining rates and liquidity. In the event of an oracle malfunction, exploit, or manipulation, the User understands and agrees that all associated risks and potential losses are borne solely by the User.
        </p>

        <p>
          Puzzle Swap does not guarantee continuous or error-free operation of the decentralized exchange, and shall not be liable for any damages, losses, or interruptions arising from blockchain congestion, smart contract vulnerabilities, network instability, or third-party service failures. Users engage with Puzzle Swap at their own risk and responsibility.
        </p>

        <h3>MegaPools</h3>

        <p>
          MegaPools are multi-asset liquidity pools operating within the Puzzle Network ecosystem, enabling Users to provide and manage liquidity across multiple tokens combined into a single aggregated pool. This structure is designed to improve overall liquidity availability, reduce slippage during token swaps, and optimize potential rewards for liquidity providers.
        </p>

        <p>
          By depositing tokens into MegaPools, Users participate in decentralized smart contracts that algorithmically balance and rebalance the pool's composition. The allocation and distribution of rewards are determined automatically by the underlying smart contract logic, depending on pool activity, trading volume, and network parameters.
        </p>

        <p>
          Users acknowledge and agree that by contributing liquidity, they are fully responsible for understanding the potential risks associated with smart contract interactions, impermanent loss, and price fluctuations of pooled tokens. The Software platform does not provide guarantees regarding the profitability or stability of rewards.
        </p>

        <p>
          The Software may utilize external oracles, price feeds, or third-party data sources to determine relative token values within the pools. In the case of an oracle exploit, malfunction, or manipulation, the User accepts that any resulting losses are borne solely by the User.
        </p>

        <p>
          The Software platform does not have custody over Users' assets and cannot reverse or cancel transactions executed on-chain. All interactions with MegaPools occur directly through smart contracts deployed on the blockchain, and the User is solely responsible for managing private keys and access credentials.
        </p>

        <h3>RANGES</h3>

        <p>
          RANGES is a concentrated liquidity module within the Puzzle Network ecosystem that enables liquidity providers to allocate liquidity within specific price ranges for trading pairs. This functionality allows for more efficient capital usage and the potential for increased profitability, as liquidity is provided only within defined market intervals.
        </p>

        <p>
          All RANGES operations are executed via smart contracts deployed on the blockchain, without any custodial control by the Software platform. Users maintain full ownership of their assets at all times and interact directly with the decentralized protocol.
        </p>

        <p>
          By participating in RANGES, Users acknowledge and understand that liquidity positions are active only within their selected price intervals, and that rapid market fluctuations or price movements outside those ranges may render liquidity inactive until readjusted. Users are responsible for monitoring and managing their own liquidity positions.
        </p>

        <p>
          The Software platform does not guarantee any level of profitability, capital efficiency, or return on provided liquidity. Users accept all risks associated with smart contract execution, market volatility, impermanent loss, and slippage.
        </p>

        <p>
          The Software may utilize external oracles or price data sources to calculate market ranges and liquidity distribution. In the event of an oracle error, manipulation, or exploit, the User agrees that all related financial losses are borne solely by the User.
        </p>

        <p>
          The Software platform shall not be held liable for any technical malfunctions, transaction failures, or inaccuracies arising from smart contracts, network congestion, or external integrations.
        </p>

        <h3>Puzzle Lend</h3>

        <p>
          Puzzle Lend is a decentralized lending and borrowing protocol within the Puzzle Network ecosystem that allows Users to deposit digital assets to earn yield or use their assets as collateral to take overcollateralized loans. The protocol operates entirely on-chain through autonomous smart contracts deployed on the blockchain.
        </p>

        <p>
          By interacting with Puzzle Lend, Users acknowledge that all lending, borrowing, liquidation, and reward operations are executed algorithmically according to the parameters defined in the protocol's smart contracts. The Software platform does not act as a custodian, intermediary, or guarantor for any deposits, loans, or collateral positions. Users maintain full control of their funds and private keys at all times.
        </p>

        <p>
          Interest rates applied to lending and borrowing activities may change at any time. Users understand and agree that such changes may affect the value of their deposits, yields, and borrowing costs.
        </p>

        <p>
          The protocol may utilize third-party price oracles to determine collateral values, interest rates, and liquidation conditions. In the event of an oracle malfunction, manipulation, or exploit, the User agrees that all losses resulting from incorrect price data or triggered liquidations are borne solely by the User.
        </p>

        <p>
          The Software platform does not provide financial, legal, or investment advice and does not guarantee the performance, profitability, or security of any lending or borrowing operations. Users interact with the protocol at their own discretion and assume all risks associated with the use of decentralized finance systems.
        </p>

        <h3>Rome Stablecoin</h3>

        <p>
          Rome Stablecoin is a decentralized stable asset within the Puzzle Network ecosystem, designed to maintain a soft peg to the United States dollar (USD). The value of Rome is algorithmically supported and backed by liquidity tokens and other decentralized assets held within smart contracts on the blockchain.
        </p>

        <p>
          The Software enables Users to mint, redeem, and transfer Rome Stablecoin through autonomous smart contracts. Users acknowledge and agree that the maintenance of the peg and collateralization ratio is performed automatically by the protocol's algorithm, without manual intervention or guarantees of absolute price stability.
        </p>

        <p>
          All operations involving Rome Stablecoin — including minting, redemption, and collateral management — are executed directly on-chain. The Software platform does not act as a custodian and has no control over Users' assets or private keys. Users remain fully responsible for securing their own wallets and transaction keys.
        </p>

        <p>
          The protocol may rely on decentralized oracles to determine collateral values and maintain the stability mechanism. In the event of an oracle exploit, malfunction, or manipulation, the User understands and agrees that any resulting losses or de-pegging events are borne solely by the User.
        </p>

        <p>
          The Software platform does not guarantee the stability, liquidity, or redemption value of the Rome Stablecoin and shall not be held liable for any losses arising from price fluctuations, smart contract errors, or broader market conditions. Users are solely responsible for assessing the risks associated with using algorithmic and collateralized stable assets.
        </p>

        <h3>Token Disclaimer</h3>

        <p>
          The PUZZLE Token and any other tokens associated with the Puzzle Network ecosystem are decentralized digital assets created and managed by smart contracts deployed on the blockchain. These tokens serve as functional and governance instruments within the ecosystem and do not represent shares, securities, ownership interests, or rights to dividends, profits, or other forms of financial returns from the Software platform or any affiliated entity.
        </p>

        <p>
          The Software platform does not guarantee the market value, price stability, liquidity, or future performance of any token within the Puzzle Network ecosystem. Token prices are determined exclusively by supply and demand in open markets and may fluctuate significantly due to factors beyond the control of the Software platform, including market conditions, regulatory developments, or third-party actions.
        </p>

        <p>
          Users acknowledge and agree that the acquisition, holding, trading, or use of any token is performed at their own risk. The Software platform does not provide any form of insurance, compensation, or restitution in the event of a loss of value, price depreciation, market volatility, smart contract failure, or security breach.
        </p>

        <p>
          The Software platform is not responsible for any losses, damages, or claims resulting from:
        </p>

        <ul>
          <li>fluctuations in the value of tokens;</li>
          <li>trading decisions made by Users;</li>
          <li>errors, bugs, or exploits in smart contracts;</li>
          <li>failures of third-party platforms or exchanges;</li>
          <li>or regulatory restrictions affecting token use or transfer.</li>
        </ul>

        <p>
          Users are solely responsible for evaluating and managing all risks associated with tokens, including the decision to buy, sell, stake, or hold them. Participation in the Puzzle Network ecosystem implies full acceptance of such risks and the absence of any guarantees of profit or stability.
        </p>

        <h3>Puzzle DAO</h3>

        <p>
          Puzzle DAO is a decentralized governance mechanism within the Puzzle Network ecosystem that enables token holders to participate in the decision-making process, protocol development, and management of key parameters of the ecosystem. Through Puzzle DAO, Users can submit, discuss, and vote on proposals affecting the operation, configuration, and evolution of the Software platform and related services.
        </p>

        <p>
          Participation in governance is conducted through on-chain voting mechanisms managed by smart contracts deployed on the Puzzle blockchain. Voting power is determined by the amount of governance tokens held or staked by each User. Users acknowledge that voting results are automatically executed by smart contracts, and once a decision is finalized, it cannot be altered or revoked by the Software platform.
        </p>

        <p>
          By taking part in Puzzle DAO governance, Users agree that all actions, votes, and proposals are performed at their own discretion and risk. The Software platform does not guarantee that approved proposals will result in beneficial outcomes, system improvements, or profit.
        </p>

        <p>
          The Software platform does not control, censor, or pre-approve governance proposals. All proposals are submitted and processed through decentralized infrastructure. In the case of technical errors, smart contract vulnerabilities, or malicious governance activity, the User acknowledges that all potential losses or protocol misconfigurations are borne solely by the User.
        </p>

        <p>
          Puzzle DAO does not provide investment or financial advisory services. Participation in DAO governance is voluntary and may involve economic risks, including governance token volatility, voting manipulation, and unintended smart contract behavior.
        </p>

        <h3>Puzzle Node</h3>

        <p>
          Puzzle Node is a decentralized infrastructure component within the Puzzle Network ecosystem that validates transactions, processes blocks, and supports the operation of decentralized applications (dApps) and services built on the network. Puzzle Nodes maintain network integrity, execute smart contracts, and contribute to consensus by independently verifying and recording transactions on the blockchain.
        </p>

        <p>
          Running or interacting with a Puzzle Node is entirely voluntary and performed at the discretion of the User. By operating a Node, Users agree to comply with the network's technical requirements and consensus rules. The Software platform does not directly control, supervise, or coordinate the activity of Node operators and does not guarantee network uptime, synchronization, or performance.
        </p>

        <p>
          Users acknowledge that node operation involves technical and financial risks, including but not limited to equipment failure, software bugs, smart contract vulnerabilities, or network forks. The Software platform shall not be held liable for any losses or damages arising from such risks, including transaction delays, missed rewards, or chain reorganization.
        </p>

        <p>
          The Software platform does not provide custodial services or assume any responsibility for the private keys, credentials, or infrastructure of Node operators. All operational responsibilities, including security, maintenance, and compliance with applicable laws, rest solely with the User.
        </p>

        <p>
          Participation in the Puzzle Node network does not grant any ownership, governance, or revenue rights in relation to the Software platform or other network participants.
        </p>

        <p>
          <strong>WE ARE NOT RESPONSIBLE FOR ACTIONS AND/OR OMISSIONS OF TEAMS THAT HAVE DEVELOPED SERVICES USING THE PUZZLE NETWORK. THE USER FULLY UNDERSTANDS AND ACCEPTS THE POSSIBILITY TO LOSE HIS OR HER ASSETS IN FULL. IT IS THE OBLIGATION OF THE USER TO STUDY THE SPECIFIC TERMS OF ALL SERVICES MADE ON THE PLATFORM. FOR MORE INFORMATION ABOUT THE TERMS OF THE SPECIFIC SERVICES, PLEASE FOLLOW THE SPECIAL LINKS TO THEIR TERMS.</strong>
        </p>

        <p>
          To use Puzzle Network Software and Services you must have and provide Puzzle Network with Waves Blockchain generated address owned by you exclusively and under your sole and full control (User address).
        </p>

        <p>
          Using the Puzzle Network, you are solely responsible for keeping the secret phrase for accessing your User address (Seed). We will encrypt your Seed with a password you set for Puzzle Network locally at your device. Also, you can use your e-mail to get access to the Services of the Software platform. We do not store or have control over your Seed or your Puzzle Network password or your e-mail and never send them to any servers. This secret information is stored locally on your devices. The Software platform is not liable for any losses that Users may suffer due to unauthorized access to your User address.
        </p>

        <p>
          We do not have access to or control over your crypto assets stored on the Waves blockchain. The private keys to these assets are encrypted and stored on the blockchain within a smart contract and available only with your Seed.
        </p>

        <p>
          Puzzle Network Software and Services are available for use by the User in the following forms: Web-version that you can use via website <a href="https://puzzle.network/" target="_blank" rel="noreferrer">https://puzzle.network/</a>.
        </p>

        <h2>3. USER WARRANTIES AND REPRESENTATIONS</h2>

        <p>By entering these Terms and using the Software and Services, you warrant and represent that:</p>
        <ul>
          <li>You have full capacity to contract under applicable law;</li>
          <li>You will only transact via the Software platform and the Services with legally obtained funds that belong to you;</li>
          <li>You will not perform, undertake, engage in, aid, or abet any unlawful activity through your relationship with us or through your use of the Software and the Services, including money laundering of criminal proceeds, transfer or receipt of payment for planning, preparation, or commitment of crime, for financing terrorism and illegal trade;</li>
          <li>You guarantee that you are not a US citizen, resident, or entity, nor are you using the Software platform or signing on behalf of a US Person;</li>
          <li>You guarantee that you are not a Chinese resident, nor are you using the Software platform or signing on behalf of a Chinese resident;</li>
          <li>You guarantee that you are not a South Korean resident, nor are you using the Software platform or signing on behalf of a South Korean resident;</li>
          <li>You guarantee that you do not reside in a jurisdiction that qualifies digital tokens as securities;</li>
          <li>You guarantee that you understand the use of cryptocurrencies and their associated risks;</li>
          <li>You will not use the Software and the Services for any purpose prohibited by these Terms or in any manner that could damage, disable, overburden, or impair the Software platform;</li>
          <li>You will comply with and obey all applicable laws, including but not limited to securities and capital market legislation, anti-money laundering, and counterfeiting terrorism.</li>
        </ul>

        <p>
          You agree and understand that you are responsible at all times for your own conduct, acts, and omissions. The Software platform is not liable for any losses that Users may suffer due to making transactions or taking other actions (or inactions) through or with the help of the Puzzle Network.
        </p>

        <p>
          You agree to indemnify and hold harmless the Software platform and any of its affiliated persons against all suits, claims, costs, losses, damages, or demands (including with regard to property loss, tax claims, infringements of intellectual or personal rights) in case of your non-compliance with these Terms.
        </p>

        <h2>4. ACCOUNT PASSWORD AND SECURITY</h2>

        <p>
          Authorization for accessing and using the Software is carried out through WX Network, which is an independent third-party service. By using WX Network for authentication, you acknowledge and agree that WX Network operates separately from our platform and that we are not responsible for any actions, data processing, or security measures undertaken by WX Network. Your use of WX Network is governed by its own terms of service and privacy policy.
        </p>

        <p>
          You hereby represent and warrant that you are fully able and competent to enter into the terms, conditions, obligations, affirmations, representations, and warranties set forth in these Terms and abide by and comply with these Terms.
        </p>

        <p>
          When using the WX Network Software and Services, you will be responsible for keeping your own account secret fifteen-word seed phrase for access to any of your user addresses and a separate password for WX Network, which you choose and set up. WX Network Software encrypts this information locally on your computer with a WX Network password you provide. We never receive and/or send any of your secret information (including Seed phrase and password) to any servers.
        </p>

        <p>
          You agree to (a) never use the same password for WX Network that you have ever used outside of WX Network, (b) keep your secret information and password confidential, and do not share them with anyone else. The Software platform cannot and will not be liable for any loss or damage arising from breaches of security and confidentiality which are out of our control.
        </p>

        <h2>5. PROVIDERWEB AND PROVIDERCLOUD</h2>

        <p>
          ProviderWeb is a framework that the User may download to facilitate access to any third-party websites by using Puzzle Network account data like the seed phrase.
        </p>

        <p>
          Puzzle Network account data is stored on the User's device.
        </p>

        <p>
          We do not have any access to User's data, and we do not keep such kind of User's data.
        </p>

        <p>
          ProviderCloud is a framework that the User may download to facilitate access to any third-party websites by using Puzzle Network account data like email. We do not have any access to such kind of User's data.
        </p>

        <h2>6. THIRD-PARTY GATEWAY</h2>

        <p>
          The Puzzle Network allows users to store and conduct non-direct transfers of tokens from other blockchains within its network. Users can send a supported token to their User address on the Waves blockchain and, in exchange, receive a representation of that token in the form of a specific native token of the Software platform. This native token can be directly transferred within the blockchain or withdrawn via a Third-party Gateway provided by WX Network. Upon withdrawal, users receive the original tokens to the desired address outside of the blockchain.
        </p>

        <p>
          WX Network operates as a Third-party Gateway service, providing an interface for token bridging and conversion. The terms and policies of WX Network are available at: <a href="https://wx.network/terms_and_conditions" target="_blank" rel="noreferrer">https://wx.network/terms_and_conditions</a>.
        </p>

        <p>
          Please review the provided link before utilizing the Gateway Services.
        </p>

        <p>
          Please note that the WX Network Gateway may be unable to process transfers of Tokens originating from cryptocurrency exchanges and/or involving the use of smart contracts. Engaging in transfers of Tokens from cryptocurrency exchanges and/or utilizing smart contracts may result in the complete loss of transferred tokens.
        </p>

        <p>
          The Software platform does not assume any responsibility for the services and activities conducted by WX Network or any other third parties, nor does it participate in any relationships that may arise between third parties and Software Users. By utilizing the services of third parties, including WX Network, you agree to adhere to the terms of service set forth by those third parties. If you do not agree to these terms of service, it is advised to refrain from using the services offered by such third parties.
        </p>

        <p>
          <strong>THIRD-PARTY SERVICES, INCLUDING WX NETWORK GATEWAY, MAY INCUR CHARGES AND OPERATE UNDER TERMS THAT DIFFER FROM THOSE SPECIFIED BY US HEREIN. PLEASE REVIEW THE TERMS AND CONDITIONS OF THE THIRD-PARTY SERVICE THOROUGHLY PRIOR TO UTILIZING IT.</strong>
        </p>

        <p>
          The Software platform lacks the capability to influence the provision of these third-party services and their outcomes. Section 16, "THIRD-PARTY WEBSITES AND CONTENT," is applicable to any third-party services, including WX Network Gateway and other crypto gateway providers.
        </p>

        <h2>7. WAVES LEASING</h2>

        <p>
          You can utilize the Waves Leasing functionality of the Puzzle Network exclusively for Waves tokens. This feature offers an interface enabling Users to execute "lease" and "cancel lease" transactions on the Waves blockchain. Users can lease the value of their Waves tokens to a third party holding a Puzzle node at their discretion, thereby increasing the stake of such third-party Puzzle node, or cancel such leasing as desired.
        </p>

        <p>
          It's important to note that the "lease" transaction to transfer the value of Waves tokens to a third party holding a Puzzle node is processed (written) to the Waves blockchain after 1000 (one thousand) blocks have been written to the Puzzle blockchain.
        </p>

        <p>
          The User holding a Puzzle node to which third parties leased the value of their Waves tokens may choose to pay the lessors a commission for the leasing, at their discretion.
        </p>

        <p>
          The "lease" and "cancel lease" transactions executed on the Waves blockchain are written directly to the decentralized Waves blockchain, indicating that the Puzzle Network Leasing Services are of a decentralized nature.
        </p>

        <p>
          As a result, we do not store, control, or manage the lease of any Waves Tokens by Users, lease terms, cancellation of lease, and/or payment of commission for the leasing by and to Users. We are not liable for any actions involving leased Waves Tokens taken by any User. Users must make their own decisions regarding the lease of Waves Tokens and accept responsibility and consequences accordingly. The Software platform does not provide financial or investment services or advice to Users concerning the use of the Waves Leasing functionality.
        </p>

        <p>
          For more information about leasing, please visit: <a href="https://lease.puzzleswap.org/" target="_blank" rel="noreferrer">https://lease.puzzleswap.org/</a>
        </p>

        <h2>8. COMMUNICATIONS AND WRITTEN NOTICES</h2>

        <p>
          Unless specifically provided otherwise in these Terms, any notice, instruction, request, or other communication to be given to us by the User under these Terms shall be in writing and sent to the email address provided below (or to any other address which we may specify to the User for this purpose from time to time). Such communication shall be deemed delivered only upon actual receipt by us at the following email address:
        </p>

        <p>
          Puzzle DAO, <a href="mailto:puzzle.moderator@gmail.com">puzzle.moderator@gmail.com</a>
        </p>

        <p>Any communications sent to the User (documents, notices, confirmations, statements etc.) are deemed received:</p>
        <ul>
          <li>If sent by email, within 30 days after emailing it;</li>
          <li>If sent by Puzzle Network chat: t.me/puzzle_network within 7 days after sending it;</li>
          <li>If sent by telephone, once the telephone conversation has been finished;</li>
          <li>If sent by post, seven calendar days after sending it;</li>
          <li>If sent via courier service, at the date of signing of the document on receipt of such notice.</li>
        </ul>

        <h2>9. INTELLECTUAL PROPERTY</h2>

        <p>
          We grant you limited, non-exclusive, non-transferable, revocable permission to make use of the Software and the Services. This access shall remain in effect until and unless terminated by you or by us.
        </p>

        <p>
          You acknowledge and agree that the Software and the Services contain proprietary and confidential information that is protected by applicable intellectual property and other laws. Except as expressly authorized by the Software platform, you agree not to copy, modify, rent, lease, loan, sell, distribute, perform, display, or create derivative works based on the Software and the Services, in whole or in part.
        </p>

        <p>
          The Software platform software, including without limitation the Software and the Services, is not in any way sold or transferred to you.
        </p>

        <p>
          You cannot and have no right to use any Puzzle Network trademarks, service marks, trade names, logos, domain names, and any other features, whether for commercial or non-commercial use, without an explicit agreement from Puzzle DAO member.
        </p>

        <p>
          You agree to abide by our user guidelines and not to use the Software and the Services or any part thereof in any manner not expressly permitted by the Terms. Except for the rights expressly granted to you in the Terms, the Software platform grants no right, title, or interest to you in the Software and the Services.
        </p>

        <p>
          Third-party software (for example, open-source software) included in the Software and the Services is made available to you under the relevant third-party software's license terms.
        </p>

        <h2>10. PROHIBITED ACTIVITIES</h2>

        <p>
          You agree that you will not use the Software and the Services to perform any type or sort of illegal activity or to take any action that negatively affects the performance of the Service. You may not engage in the following activities via the Services, nor assist a third party in any such activity:
        </p>

        <ul>
          <li>attempt to gain unauthorized access to our Software and Services or another user's orders or User address;</li>
          <li>make any attempt to bypass or circumvent any security features;</li>
          <li>violate any law, statute, ordinance, regulation, or these Terms;</li>
          <li>reproduce, duplicate, copy, sell or resell the Software and Services for any purpose except as authorized in these Terms;</li>
          <li>engage in any activity that is abusive or interferes with or disrupts our Software and Services (for example, DDoS attacks).</li>
        </ul>

        <p>
          If you are blocked from accessing the Software and Services, you agree not to implement any measures to circumvent such blocking. The use of our Software and Services in connection with any transaction involving illegal services, purposes, or tokens is prohibited.
        </p>

        <h2>11. LIMITATION ON LIABILITY</h2>

        <p>
          <strong>YOU ACKNOWLEDGE AND AGREE THAT YOU ASSUME FULL RESPONSIBILITY FOR YOUR USE OF THE SOFTWARE AND SERVICES. YOU ACKNOWLEDGE AND AGREE THAT ANY INFORMATION YOU SEND OR RECEIVE DURING YOUR USE OF THE SOFTWARE AND SERVICES MAY NOT BE SECURE AND MAY BE INTERCEPTED OR LATER ACQUIRED BY UNAUTHORIZED PARTIES. YOU ACKNOWLEDGE AND AGREE THAT YOUR USE OF THE SOFTWARE AND SERVICES IS AT YOUR OWN RISK. RECOGNIZING SUCH, YOU UNDERSTAND AND AGREE THAT, TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, NEITHER SOFTWARE PLATFORM NOR ITS AFFILIATED PERSONS OR REPRESENTATIVES WILL BE LIABLE TO YOU FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, EXEMPLARY, OR OTHER DAMAGES OF ANY KIND, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER TANGIBLE OR INTANGIBLE LOSSES OR ANY OTHER DAMAGES BASED ON CONTRACT, TORT, STRICT LIABILITY, OR ANY OTHER GROUND (EVEN IF SOFTWARE PLATFORM HAD BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES), RESULTING FROM THE SERVICE; THE USE OR THE INABILITY TO USE SOFTWARE AND SERVICES; UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR TRANSMISSIONS OR DATA; STATEMENTS OR CONDUCT OF ANY THIRD PARTY ON THE SOFTWARE AND SERVICES; ANY ACTIONS WE TAKE OR FAIL TO TAKE AS A RESULT OF COMMUNICATIONS YOU SEND TO US; HUMAN ERRORS; TECHNICAL MALFUNCTIONS; FAILURES, INCLUDING PUBLIC UTILITY OR INTERNET OUTAGES; OMISSIONS, INTERRUPTIONS, LATENCY, DELETIONS, OR DEFECTS OF ANY DEVICE OR NETWORK, PROVIDERS, OR SOFTWARE; ANY INJURY OR DAMAGE TO COMPUTER EQUIPMENT; INABILITY TO FULLY ACCESS THE SOFTWARE AND SERVICES OR USE THE SOFTWARE AND SERVICES; THEFT, TAMPERING, DESTRUCTION, OR UNAUTHORIZED ACCESS TO IMAGES OR OTHER CONTENT OF ANY KIND; DATA THAT IS PROCESSED LATE OR INCORRECTLY OR IS INCOMPLETE OR LOST; TYPING, PRINTING, OR OTHER ERRORS, OR ANY COMBINATION THEREOF; OR ANY OTHER MATTER RELATING TO THE SOFTWARE AND SERVICES.</strong>
        </p>

        <p>
          The Software platform shall not have any liability or responsibility for any errors or omissions in the performance of the Software and the Services, for your action or inaction in connection with the Software and Services, or for any damage to your computer, data, funds, or any other damage you may incur in connection with the Software and the Services. Your use of the Software and the Services is at your own risk. In no event shall the Software platform be liable for any direct, indirect, punitive, incidental, special, or consequential damages arising out of or in any way connected with the use of the Software and the Services, the delay or inability to use the Software and the Services, or otherwise arising in connection with the Software and Services, whether based on contract, tort, strict liability, or otherwise, even if advised of the possibility of any such damages.
        </p>

        <p>
          You expressly understand and agree that your use of the Software and the Services is at your sole risk. The Software and the Services are provided on an "AS IS" and "as available" basis, without warranties of any kind, either express or implied, including, without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement. You acknowledge that the Software platform has no control over, and no duty to take any action regarding: which users gain access to or use the Software and the Services; which third-party websites and services you use with the help of or through the Software and the Services; how you may use the Software and Services; or what actions you may take with the help of the Software and the Services. You release the Software platform from all liability for you having acquired or not acquired Content through the Software and the Services. The Software platform makes no representations concerning any content contained in or accessed through the Software and the Services.
        </p>

        <p>
          You acknowledge that the Software platform is not responsible for transferring, safeguarding, or maintaining your private keys, passwords, or any crypto-assets accessible therewith. If you lose, mishandle, or have stolen password or private keys, you acknowledge that you may not be able to recover your crypto-assets accessible via such private keys and passwords and that the Software platform is not responsible for such loss. You acknowledge that the Software platform is not responsible for any loss, damage, or liability arising from your failure to comply with the Terms hereunder.
        </p>

        <h2>12. THIRD-PARTY WEBSITES AND CONTENT</h2>

        <p>
          The Software and the Services may contain links to websites or services owned or operated by parties other than the Software platform (including, but not limited to, third-party crypto gateway services). Such links are provided for your reference only. The Software platform does not monitor or control resources outside the Software and the Services and is not responsible for their content. The inclusion of links to third-party resources does not imply any endorsement of the material in the Software and the Services or, unless expressly disclosed otherwise, any sponsorship, affiliation, or association with its owner, operator, or sponsor, nor does such inclusion of links imply that the Software platform is authorized to use any trade name, trademark, logo, legal or official seal, or copyrighted symbol that may be reflected on the linked website. The Software platform does not control the third-party content or monitor it for compliance with any requirement (e.g., truthfulness, integrity, legality). Accordingly, the Software platform does not bear any liability arising in connection with your access or use of the third-party content.
        </p>

        <h2>13. INDEMNITY</h2>

        <p>
          You agree to release and indemnify, defend, and hold harmless the Software platform and its parents, subsidiaries, affiliates, and agencies, as well as the officers, directors, employees, shareholders, and representatives of any of the foregoing entities, from and against any and all losses, liabilities, expenses, damages, costs (including attorneys' fees and court costs), claims, or actions of any kind whatsoever arising or resulting from your use of the Software and Services, your violation of these Terms of Use, and any of your acts or omissions that implicate publicity rights, defamation, or invasion of privacy. The Software platform reserves the right, at its own expense, to assume exclusive defense and control of any matter otherwise subject to indemnification by you, and in such case, you agree to cooperate with the Software platform in the defense of such matter.
        </p>

        <h2>14. FORCE MAJEURE</h2>

        <p>A Force Majeure Event includes without limitation each of the following:</p>
        <ul>
          <li>Government actions, the outbreak of war or hostilities, the threat of war, acts of terrorism, national emergency, riot, civil disturbance, sabotage, requisition, or any other international calamity, economic or political crisis;</li>
          <li>Act of God, earthquake, tsunami, hurricane, typhoon, accident, storm, flood, fire, epidemic, pandemic or other natural disasters;</li>
          <li>Labour disputes and lock-out;</li>
          <li>Breakdown, failure or malfunction of any electronic, network and communication lines (not due to our fault);</li>
          <li>Any event, act, or circumstances not reasonably within our control and the effect of that event(s) is such that WX Network support is not in a position to take any reasonable action to cure the default.</li>
        </ul>

        <h2>15. COMPLAINTS</h2>

        <p>
          In the event that an alleged breach, controversy, claim, dispute, or difference (a Dispute) arises between you and us out of or in connection with your use of the Service and/or these Terms (including but not limited to the validity, performance, breach, or termination thereof), the parties shall seek to resolve the matter by negotiation by referring the matter first to:
        </p>

        <ul>
          <li>if to you – to any member of your executive management in case of legal persons, or you personally if you are acting as a natural person;</li>
          <li>if to Puzzle Network - to the Puzzle Network chat in Telegram.</li>
        </ul>

        <p>
          If you wish to report an error or a Dispute, you must send an email to Puzzle Network at <a href="mailto:puzzle.moderator@gmail.com">puzzle.moderator@gmail.com</a>
        </p>

        <p>The following information will need to be included:</p>
        <ul>
          <li>your name and surname;</li>
          <li>your e-mail address (or other recognition details);</li>
          <li>detailed enquiry description;</li>
          <li>the date and time that the issue arose.</li>
        </ul>

        <p>
          Additionally, you must inform us about any error in the Software and Services within 24 hours from the time the error occurs. Failure to report errors within this timeframe may result in Puzzle Network support being unable to investigate the error.
        </p>

        <h2>16. DISPUTE RESOLUTION, PLACE OF JURISDICTION AND GOVERNING LAW</h2>

        <p>
          These terms shall exclusively be governed by and construed in accordance with the substantive laws of the Republic of Seychelles. If parties cannot reach a resolution through negotiation, any dispute, controversy, or claim arising from or related to these terms, including validity, breach, or termination, shall be settled by arbitration in accordance with the Federation Rules of International Arbitration of the Federation Chambers of Commerce. The arbitration panel shall consist of one arbitrator, and the seat of arbitration shall be Victoria, the Republic of Seychelles. Arbitral proceedings shall be conducted in English.
        </p>

        <p>
          All disputes, regardless of the purpose for which they arise, must be brought in the parties' individual capacity and not as a plaintiff or class member in any purported class action. This includes disputes relating to class arbitration, and unless otherwise agreed, the arbitrator may not consolidate more than one person's claims. By accepting these terms, you and we both waive the right to a trial by jury or to participate in any class or representative proceeding.
        </p>

        <p>
          You understand and agree that legal proceedings may incur costs for you as they will take place in the Republic of Seychelles.
        </p>

        <p>
          You represent and warrant that you are not a citizen or resident of the United States of America, and that you are not otherwise considered a "U.S. Person" under Regulation S of the U.S. Securities Act of 1933. The Puzzle Network does not make the Software and Services available to any U.S. Person. You agree not to use VPNs or other technological methods to circumvent this restriction. Any access or use of the Software and Services by U.S. Persons is unauthorized and constitutes a violation of these Terms of Use.
        </p>

        <h2>17. RISKS</h2>

        <p>
          <strong>Third-Party Services and Websites.</strong> You acknowledge and agree that the Software platform is not responsible for the third-party services and websites you use and interact with the help of WX Network Software and Services, and that you shall access the trustworthiness of any third-party websites, products, smart-contracts, or content you access or use through the WX Network Software and Services independently. You further expressly acknowledge that third-party websites and services can be maliciously or negligently harmful, causing mistakes and/or failures of WX Network operation and that the Software platform can not be held liable for your interaction with such third-party websites and services and related loss of property or even identity.
        </p>

        <p>
          <strong>Risk of Blockchain Technology Usage.</strong> You understand that blockchain technologies including Waves blockchain technology and other associated and related technologies, are new and untested and outside of your or the Software platform's control and adverse changes in market forces or the technology, broadly construed, may cause the nonperformance by the Software platform under this Agreement including temporary interruption or permanent termination of your access to the Software and Services, forks, rollbacks or bugs causing loss of your crypto-assets. By utilizing the Software and Services or interacting with the content in any way, you represent that you understand the inherent risks associated with blockchain systems; and warrant that you have an understanding of the usage and intricacies of blockchain-based software systems and crypto tokens.
        </p>

        <p>
          <strong>Risk of Software Weaknesses.</strong> You understand and accept that the underlying software is still in an early development stage and unproven, why there is no warranty that the Services will be uninterrupted or error-free and why there is an inherent risk that the Software could contain weaknesses, vulnerabilities, inter alia, the complete loss of your crypto-assets.
        </p>

        <p>
          <strong>Risk of Theft or Unauthorized Access.</strong> You understand and accept that the underlying software application and the Software platform (i.e. the Waves, Bitcoin and Ethereum blockchains, etc.) may be exposed to attacks by hackers or other individuals that could result in theft or loss of your crypto-assets. Advances in code cracking or technical advances such as the development of quantum computers may present risks to crypto-assets and Service, which could result in the theft or loss of your crypto-assets.
        </p>

        <p>
          <strong>Volatility of Cryptocurrencies.</strong> You understand that crypto-assets and other blockchain technologies and associated currencies or tokens are highly volatile due to many factors, including but not limited to adoption, speculation, regulatory changes, technology and security risks. Forks and changes in relevant network may result in significant and sudden changes to the value and/or usability of your crypto-assets. You acknowledge these risks and represent that Company cannot be held liable for such risks and related costs.
        </p>

        <p>
          <strong>Sophistication.</strong> The services of Puzzle Network are complex and carry a high level of risk, and are not appropriate for Users who do not possess the appropriate level of knowledge and experience to deal with crypto-assets. The Software platform is under no obligation to assess the suitability of the services for Users and any comment or statement which may be made by the Software platform as to the suitability of the Services to the User should under no circumstances be considered as investment or legal advice and should not be received or relied upon as such.
        </p>

        <p>
          <strong>Risk of Loss of Funds.</strong> The trading market for crypto-assets is highly unstable. Prices for cryptoassets can and do fluctuate at any given moment for any reason. Due to such price fluctuations, you may gain or lose value in your crypto assets at any given moment. Any asset or trading position may be subject to large swings in value and may even become worthless. You should have deep expertise in trading crypto assets. Moreover, the User shall bear any loss resulted in his/her own fault or error. The risk of loss in trading or holding crypto-assets can be substantial. Therefore, you should carefully consider whether trading or holding crypto-assets is suitable for you in light of your financial condition.
        </p>

        <p>
          <strong>Internet transmission and failures in functionality.</strong> You acknowledge that there are risks associated with utilizing Puzzle Network including, but not limited to, the failure of hardware, software, and Internet connections. You acknowledge that the Software platform shall not be responsible for any communication failures, disruptions, errors, distortions or delays you may experience when trading via Puzzle Network, however, caused. You acknowledge that there are risks inherent in internet connectivity and technologies that could result in the loss of your privacy, confidential information and property.
        </p>

        <p>
          <strong>Unfavorable regulatory environment.</strong> Cryptocurrencies, blockchain technologies have been the subject of scrutiny by various regulatory bodies around the world. The functioning of the Software and maintenance of the Services could be impacted by one or more regulatory inquiries or actions, including but not limited to restrictions of use of crypto- assets.
        </p>

        <p>
          The Software platform and its third-party service providers have implemented and maintained commercially reasonable technical and organizational security measures designed to meet the following objectives: (a) ensure the security and confidentiality of your data; (b) protect against anticipated threats or hazards to the security or integrity of your data; (c) protect against unauthorized access to or use of your data. However, we cannot guarantee that unauthorized third parties will never be able to defeat those measures to access your data for improper purposes. Herewith you acknowledge and agree that you access and use the Software and Services at your own risk. The risk of loss of value of held and traded crypto- assets can be substantial. You should, therefore, carefully consider whether such trading is suitable for you in light of your circumstances and financial resources.
        </p>

        <p>
          These warnings and others later provided by the Software platform in no way evidence or represent an on-going duty to alert you of all of the potential risks of utilizing the Software and Services.
        </p>

        <h2>18. OTHER INFORMATION</h2>

        <h3>Entire Agreement/assignment</h3>

        <p>
          These Terms, along with any additional terms, rules, and conditions of participation that the Software platform may provide regarding the use of the Software and Services, constitute the entire agreement between you and the Software platform. They supersede any prior agreements, whether oral or written, between you and the Software platform. In the event of a conflict between these Terms and any additional terms, rules, and conditions of participation, the latter will prevail over the Terms to the extent of the conflict. The Software platform reserves the right to assign these Terms to its parent company, affiliate, subsidiary, or in connection with a merger, consolidation, or sale of substantially all its assets.
        </p>

        <h3>Waiver and Severability of Terms</h3>

        <p>
          The failure of the Software platform to exercise or enforce any right or provision of these Terms shall not constitute a waiver of such right or provision. If any provision of these Terms is found by an arbitrator or court of competent jurisdiction to be invalid, the parties agree that the arbitrator or court should endeavor to give effect to the parties' intentions as reflected in the provision, and the other provisions of these Terms remain in full force and effect.
        </p>

        <h3>Taxation</h3>

        <p>
          You bear the sole responsibility to determine if your use of the Service and/or any other action or transaction you made through Puzzle Network Service have tax implications for you and for payment of all applicable taxes. By using the Services, and to the extent permitted by law, you agree not to hold us liable for any tax liability associated with or arising from the operation of the Services or any other action or transaction related to Puzzle Network.
        </p>

        <p>
          By using the Services, and to the extent permitted by law, you agree not to hold us liable for any tax liability associated with or arising from the operation of the Services or any other action or transaction related to Puzzle Network.
        </p>

      </ContentWrapper>
    </Root>
  );
};

export default TermsOfService;
