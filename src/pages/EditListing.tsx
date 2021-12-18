import {
  ChangeEvent,
  FC,
  FormEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import { app, db } from 'firebase.config';
import { Spinner } from 'components';
import { toast } from 'react-toastify';

const EditListing: FC = () => {
  const [geolocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState<DocumentData | null>(null);
  const [formData, setFormData] = useState<DocumentData | null>({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
  });
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData!;
  const params = useParams();

  const auth = getAuth(app);
  const navigate = useNavigate();
  const isMounted = useRef(true);

  // sets userRef to loggedin user
  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
        } else {
          navigate('/sign-in');
        }
      });
    }

    return () => {
      isMounted.current = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted]);

  // fetch listing to edit
  useEffect(() => {
    setLoading(true);
    const fetchListing = async () => {
      const docRef = doc(db, 'listings', params.listingId!);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        setListing(docSnapshot.data());
        setFormData({
          ...docSnapshot.data(),
          address: docSnapshot.data().location,
        });
        setLoading(false);
      } else {
        navigate('/listing');
        toast.error('Listing not found');
      }
    };

    fetchListing();
  }, [navigate, params.listingId]);

  // redirect if listing is not users
  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser!.uid) {
      toast.error('You can not edit that listing');
      navigate('/');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setLoading(true);

    if (discountedPrice! >= regularPrice) {
      setLoading(false);
      toast.error('Disoundted price needs to be less than regular price');
      return;
    }

    if (images!.length > 6) {
      setLoading(false);
      toast.error('You can only upload 6 images');
      return;
    }

    let geolocation: {
      lat?: number;
      lng?: number;
    } = {};
    let location;

    if (geolocationEnabled) {
      const responce = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GOOGLE_GEOLOCATION_API_KEY}`
      );
      const data = await responce.json();

      geolocation.lat = data.results[0]?.geometry.location.lat ?? 0;
      geolocation.lng = data.results[0]?.geometry.location.lng ?? 0;
      location =
        data.status === 'ZERO_RESULTS'
          ? undefined
          : data.results[0]?.formatted_address;

      if (location === undefined || location.includes('undefined')) {
        setLoading(false);
        toast.error('Pease enter a corrent address');
        return;
      }
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;
    }

    // Store image in firebase
    const storeImage = async (image: File) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser!.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, 'images/' + fileName);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
              default:
                break;
            }
          },
          (error) => {
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };

    const imageUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false);
      toast.error('Images not uploaded');
      return;
    });

    const formDataCopy: DocumentData | null = {
      ...formData,
      imageUrls,
      geolocation,
      timestamp: serverTimestamp(),
    };
    formDataCopy.location = address;
    delete formDataCopy.images;
    delete formDataCopy.address;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    const docRef = doc(db, 'listings', params.listingId!);
    await updateDoc(docRef, formDataCopy);

    setLoading(false);
    toast.success('Listing saved');
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  const onMutate = (e: ChangeEvent | MouseEvent) => {
    let boolean: boolean | null = null;

    if ((e.target as HTMLInputElement).value === 'true') {
      boolean = true;
    }
    if ((e.target as HTMLInputElement).value === 'false') {
      boolean = false;
    }

    // files
    if ((e.target as HTMLInputElement).files) {
      setFormData((prevState) => ({
        ...prevState,
        images: (e.target as HTMLInputElement).files,
      }));
    }

    // text / bool / numbers
    if (!(e.target as HTMLInputElement).files) {
      setFormData((prevState) => ({
        ...prevState,
        [(e.target as HTMLInputElement).id]:
          boolean ?? (e.target as HTMLInputElement).value,
      }));
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="profile">
      <header className="pageHeader">
        <p>Edit Listing</p>
      </header>
      <main>
        <form onSubmit={onSubmit}>
          <label className="formLabel">Sell / Rent</label>
          <div className="formButtons">
            <button
              type="button"
              id="type"
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              value="sale"
              onClick={onMutate}
            >
              Sell
            </button>
            <button
              type="button"
              id="type"
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              value="rent"
              onClick={onMutate}
            >
              Rent
            </button>
          </div>
          <label className="formLabel">Name</label>
          <input
            type="text"
            className="formInputName"
            id="name"
            value={name}
            onChange={onMutate}
            maxLength={32}
            minLength={10}
            required
          />
          <div className="formRooms flex">
            <div>
              <label className="formLabel">Bedrooms</label>
              <input
                type="number"
                className="formInputSmall"
                id="bedrooms"
                value={bedrooms}
                onChange={onMutate}
                max={50}
                min={1}
                required
              />
            </div>
            <div>
              <label className="formLabel">Bathrooms</label>
              <input
                type="number"
                className="formInputSmall"
                id="bathrooms"
                value={bathrooms}
                onChange={onMutate}
                max={50}
                min={1}
                required
              />
            </div>
          </div>
          <label className="formLabel">Parking spot</label>
          <div className="formButtons">
            <button
              type="button"
              id="parking"
              className={parking ? 'formButtonActive' : 'formButton'}
              value="true"
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              id="parking"
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              value="false"
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel">Furnished</label>
          <div className="formButtons">
            <button
              type="button"
              id="furnished"
              className={furnished ? 'formButtonActive' : 'formButton'}
              value="true"
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              id="furnished"
              className={
                !furnished && furnished !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              value="false"
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel">Address</label>
          <textarea
            id="address"
            className="formInputAddress"
            value={address}
            onChange={onMutate}
            required
          />
          {!geolocationEnabled && (
            <div className="fromLatLng flex">
              <div>
                <label className="formLabel">Latitude</label>
                <input
                  type="number"
                  id="latitude"
                  className="formInputSmall"
                  value={latitude}
                  onChange={onMutate}
                  required
                />
              </div>
              <div>
                <label className="formLabel">Longitude</label>
                <input
                  type="number"
                  id="longitude"
                  className="formInputSmall"
                  value={longitude}
                  onChange={onMutate}
                  required
                />
              </div>
            </div>
          )}
          <label className="formLabel">Offer</label>
          <div className="formButtons">
            <button
              type="button"
              id="offer"
              className={offer ? 'formButtonActive' : 'formButton'}
              value="true"
              onClick={onMutate}
            >
              Yes
            </button>
            <button
              type="button"
              id="offer"
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              value="false"
              onClick={onMutate}
            >
              No
            </button>
          </div>
          <label className="formLabel">Regular Price</label>
          <div className="formPriceDiv">
            <input
              className="formInputSmall"
              type="number"
              id="regularPrice"
              value={regularPrice}
              onChange={onMutate}
              min="50"
              max="750000000"
              required
            />
            {type === 'rent' && <p className="formPriceText">$ / Month</p>}
          </div>
          {offer && (
            <>
              <label className="formLabel">Discounted Price</label>
              <input
                className="formInputSmall"
                type="number"
                id="discountedPrice"
                value={discountedPrice}
                onChange={onMutate}
                min="50"
                max="750000000"
                required={offer}
              />
            </>
          )}
          <label className="formLabel">Images</label>
          <p className="imagesInfo">
            The first image will be the cover (max 6).
          </p>
          <input
            className="formInputFile"
            type="file"
            id="images"
            onChange={onMutate}
            max="6"
            accept=".jpg,.png,.jpeg"
            multiple
            required
          />
          <button type="submit" className="primaryButton createListingButton">
            Edit Listing
          </button>
        </form>
      </main>
    </div>
  );
};

export default EditListing;
