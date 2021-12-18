import { ChangeEvent, FC, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getAuth, updateProfile } from 'firebase/auth';
import {
  doc,
  getDocs,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  DocumentData,
  deleteDoc,
} from 'firebase/firestore';
import { app, db } from 'firebase.config';
import { ListingItem } from 'components';
import arrowRight from 'assets/svg/keyboardArrowRightIcon.svg';
import homeIcon from 'assets/svg/homeIcon.svg';

interface ListingsState {
  id: string;
  data: DocumentData;
}

const Profile: FC = () => {
  const auth = getAuth(app);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<ListingsState[] | null>(null);
  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser!.displayName,
    email: auth.currentUser!.email,
  });
  const { name, email } = formData;

  useEffect(() => {
    const fetchUserListings = async () => {
      const listingsRef = collection(db, 'listings');
      const q = query(
        listingsRef,
        where('userRef', '==', auth.currentUser!.uid),
        orderBy('timestamp', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const newListings: ListingsState[] = [];

      querySnapshot.forEach((doc) => {
        return newListings.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setListings(newListings);
      setLoading(false);
    };

    fetchUserListings();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.currentUser!.uid]);

  const onLogout = () => {
    auth.signOut();
    navigate('/');
  };

  const onSubmit = async () => {
    try {
      if (auth.currentUser!.displayName !== name) {
        // update display name in firebase
        await updateProfile(auth.currentUser!, {
          displayName: name,
        });

        // update in firestore
        const userRef = doc(db, 'users', auth.currentUser!.uid);
        await updateDoc(userRef, {
          name,
        });
      }
    } catch (error) {
      toast.error('Could not update profile details');
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  const onDelete = async (listingId: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await deleteDoc(doc(db, 'listings', listingId!));
        const updatedListings = listings!.filter(
          (listing) => listing.id !== listingId
        );
        setListings(updatedListings);
        toast.success('Successfully deleted listing');
      } catch (error) {
        toast.error('Could not delete listing');
      }
    }
  };

  return (
    <div className="profile">
      <header className="profileHeader pageHeader">
        <p>My Profile</p>
        <button type="button" className="logOut" onClick={onLogout}>
          Logout
        </button>
      </header>
      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <p
            className="changePersonalDetails"
            onClick={() => {
              changeDetails && onSubmit();
              setChangeDetails((prevState) => !prevState);
            }}
          >
            {changeDetails ? 'done' : 'change'}
          </p>
        </div>
        <div className="profileCard my-2">
          <form>
            <input
              type="text"
              id="name"
              className={!changeDetails ? 'profileName' : 'profileNameActive'}
              disabled={!changeDetails}
              value={name!}
              onChange={onChange}
            />
            <input
              type="text"
              id="email"
              className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
              disabled={!changeDetails}
              value={email!}
              onChange={onChange}
            />
          </form>
        </div>
        <Link to="/create-listing" className="createListing p-2 ">
          <img src={homeIcon} alt="Home" />
          <p>Sell or rent your home</p>
          <img src={arrowRight} alt="Arrow Right" />
        </Link>
        {!loading && listings!.length > 0 && (
          <>
            <p className="listingText">Your Listings</p>
            <ul className="listingsList">
              {listings?.map((listing) => (
                <ListingItem
                  {...{
                    key: listing.id,
                    id: listing.id,
                    listing: listing.data,
                    onDelete: () => onDelete(listing.id),
                  }}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;
