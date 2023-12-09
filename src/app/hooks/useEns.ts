import { useQuery } from "@airstack/airstack-react";

const useEns = (ens?: string) => {
  const query = `
  query EnsQuery($ens: String, $identity: Identity) {
    Domain(input: {blockchain: ethereum, name: $ens}) {
      name
      resolvedAddress
    }
    Socials(input: {filter: {identity: {_eq: $identity}}, blockchain: ethereum}) {
      Social {
        userId
        twitterUserName
        profileImageContentValue {
          image {
            medium
          }
        }
      }
    }
  }
    `;

  interface QueryResponse {
    data: Data | null;
    loading: boolean;
    error: Error;
  }

  interface Error {
    message: string;
  }

  interface Data {
    Domain: Domain;
    Socials: Socials;
  }

  interface Domain {
    name: string;
    resolvedAddress: string;
  }

  interface Socials {
    Social: Social[];
  }

  interface Social {
    userId: string;
    twitterUserName: string;
    profileImageContentValue: ProfileImageContentValue;
  }

  interface ProfileImageContentValue {
    image: Image;
  }

  interface Image {
    medium: string;
  }

  const { data, loading, error }: QueryResponse = useQuery(
    query,
    { ens, identity: ens },
    { cache: false }
  );

  return {
    data: {
      name: data?.Domain.name,
      resolvedAddress: data?.Domain.resolvedAddress,
      twitter: data?.Socials.Social[0].twitterUserName,
      avatar: data?.Socials.Social[0].profileImageContentValue.image?.medium,
    },
    isLoading: loading,
    error,
  };
};

export default useEns;
