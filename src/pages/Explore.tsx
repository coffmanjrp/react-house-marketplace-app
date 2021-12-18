import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Slider } from 'components';
import rentCategoryImage from 'assets/jpg/rentCategoryImage.jpg';
import sellCategoryImage from 'assets/jpg/sellCategoryImage.jpg';

const Explore: FC = () => {
  return (
    <div className="explore">
      <header className="pageHeader">
        <p>Explore</p>
      </header>
      <main>
        <Slider />
        <div className="exploreCategoryHeading my-3">Categories</div>
        <div className="exploreCategories">
          <Link to="/category/rent">
            <img
              src={rentCategoryImage}
              alt="Rent"
              className="exploreCategoryImg"
            />
            <p className="exploreCategoryName mt-2">Places for rent</p>
          </Link>
          <Link to="/category/sale">
            <img
              src={sellCategoryImage}
              alt="Sell"
              className="exploreCategoryImg"
            />
            <p className="exploreCategoryName mt-2">Places for sell</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Explore;
