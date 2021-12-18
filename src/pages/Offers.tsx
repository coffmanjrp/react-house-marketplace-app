import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
} from 'firebase/firestore';
import { db } from 'firebase.config';
import { ListingItem, Spinner } from 'components';

interface ListingsState {
  id: string;
  data: DocumentData;
}

const Offers: FC = () => {
  const [listings, setListings] = useState<ListingsState[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] =
    useState<DocumentData | null>(null);
  const params = useParams();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // get reference
        const listingsRef = collection(db, 'listings');

        // create a query
        const q = query(
          listingsRef,
          where('offer', '==', true),
          orderBy('timestamp', 'desc'),
          limit(10)
        );

        // execure query
        const querySnapshot = await getDocs(q);

        const listings: ListingsState[] = [];

        const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

        setLastFetchedListing(lastVisible);

        querySnapshot.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        setListings(listings);
        setLoading(false);
      } catch (error) {
        toast.error('Could not fetch listings');
      }
    };

    fetchListings();
  }, []);

  // pagination / load more
  const onFetchMoreListings = async () => {
    try {
      // get reference
      const listingsRef = collection(db, 'listings');

      // create a query
      const q = query(
        listingsRef,
        where('offer', '==', true),
        orderBy('timestamp', 'desc'),
        startAfter(lastFetchedListing),
        limit(10)
      );

      // execure query
      const querySnapshot = await getDocs(q);

      const listings: ListingsState[] = [];

      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

      setLastFetchedListing(lastVisible);

      querySnapshot.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setListings((prevState) => [...prevState!, ...listings]);
      setLoading(false);
    } catch (error) {
      toast.error('Could not fetch listings');
    }
  };

  return (
    <div className="category">
      <header className="pageHeader">
        <p>Offers</p>
      </header>
      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing) => (
                <ListingItem
                  {...{
                    key: listing.id,
                    id: listing.id,
                    listing: listing.data,
                  }}
                />
              ))}
            </ul>
          </main>
          <br />
          <br />
          {lastFetchedListing && (
            <p className="loadMore" onClick={onFetchMoreListings}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>There are no current offers</p>
      )}
    </div>
  );
};

export default Offers;
