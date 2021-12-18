import { FC, useEffect, useState } from 'react';
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

  useEffect(() => {
    const fetchListings = async () => {
      const listingsRef = collection(db, 'listings');
      const q = query(listingsRef, orderBy('timestamp', 'desc'), limit(5));
      const querySnapshot = await getDocs(q);

      let newListings: ListingsState[] = [];

      querySnapshot.forEach((doc) => {
        return newListings!.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      console.log(newListings);

      setListings(newListings);
      setLoading(false);
    };

    fetchListings();
  }, []);

  if (loading) {
    return <Spinner />;
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
