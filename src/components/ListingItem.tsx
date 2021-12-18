import { FC } from 'react';
import { Link } from 'react-router-dom';
import { DocumentData } from 'firebase/firestore';
import { ReactComponent as DeleteIcon } from 'assets/svg/deleteIcon.svg';
import { ReactComponent as EditIcon } from 'assets/svg/editIcon.svg';
import bedIcon from 'assets/svg/bedIcon.svg';
import bathtubIcon from 'assets/svg/bathtubIcon.svg';

interface Props {
  id: string | number;
  listing: DocumentData;
  onDelete?: (listingId: string) => void;
  onEdit?: (listingId: string) => void;
}

const ListingItem: FC<Props> = ({ listing, id, onDelete, onEdit }) => {
  return (
    <li className="categoryListing">
      <Link
        to={`/category/${listing.type}/${id}`}
        className="categoryListingLink"
      >
        <img
          src={listing.imageUrls[0]}
          alt={listing.name}
          className="categoryListingImg"
        />
        <div className="categoryListingDetails">
          <p className="categoryListingLocation">{listing.location}</p>
          <p className="categoryListingName">{listing.name}</p>
          <p className="categoryListingPrice">
            $
            {listing.offer
              ? listing.discountedPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              : listing.regularPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            {listing.type === 'rent' && ' / Month'}
          </p>
          <div className="categoryListingInfoDiv my-1">
            <img src={bedIcon} alt="Bed" />
            <p className="categoryListingInfoText">
              {listing.bedrooms > 1
                ? `${listing.bedrooms} Bedrooms`
                : '1 Bedroom'}
            </p>
            <img src={bathtubIcon} alt="Bathtub" />
            <p className="categoryListingInfoText">
              {listing.bathrooms > 1
                ? `${listing.bathrooms} Bathrooms`
                : '1 Bathroom'}
            </p>
          </div>
        </div>
      </Link>
      {onDelete && (
        <DeleteIcon
          className="removeIcon"
          fill="rgb(231, 76, 60)"
          onClick={() => onDelete(listing.id)}
        />
      )}
      {onEdit && (
        <EditIcon
          className="editIcon"
          fill="rgb(0, 0, 0)"
          onClick={() => onEdit(listing.id)}
        />
      )}
    </li>
  );
};

export default ListingItem;
