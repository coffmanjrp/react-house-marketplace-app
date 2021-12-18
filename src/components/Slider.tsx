import { FC, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SwiperCore, { Navigation, Pagination, Scrollbar, A11y } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  DocumentData,
} from 'firebase/firestore';
import { db } from 'firebase.config';
import { Spinner } from 'components';

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);

interface ListingsState {
  id: string;
  data: DocumentData;
}

const Slider: FC = () => {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<ListingsState[] | null>(null);
  const navigate = useNavigate();
  const isMounted = useRef(true);

  // sets userRef to loggedin user
  useEffect(() => {
    if (isMounted) {
      const fetchListings = async () => {
        const listingsRef = collection(db, 'listings');
        const q = query(listingsRef, orderBy('timestamp', 'desc'), limit(5));
        const querySnapshot = await getDocs(q);

        const newListings: ListingsState[] = [];

        querySnapshot.forEach((doc) => {
          return newListings!.push({
            id: doc.id,
            data: doc.data(),
          });
        });

        setListings(newListings);
        setLoading(false);
      };

      fetchListings();

      return () => {
        isMounted.current = false;
      };
    }
  }, [isMounted]);

  if (loading) {
    return <Spinner />;
  }

  if (listings!.length === 0) {
    return <></>;
  }

  return (
    listings && (
      <>
        <p className="exploreHeading">Recomended</p>
        <Swiper slidesPerView={1} pagination={{ clickable: true }}>
          {listings.map(({ data, id }) => (
            <SwiperSlide
              key={id}
              onClick={() => navigate(`/category/${data.type}/${id}`)}
            >
              <div
                className="swiperSlideDiv"
                style={{
                  background: `url(${data.imageUrls[0]}) center no-repeat`,
                  backgroundSize: 'cover',
                }}
              >
                <p className="swiperSlideText">{data.name}</p>
                <p className="swiperSlidePrice">
                  ${data.discontedPrice ?? data.regularPrice}{' '}
                  {data.type === 'rent' && '/ month'}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </>
    )
  );
};

export default Slider;
