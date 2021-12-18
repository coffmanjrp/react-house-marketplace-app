import { ChangeEvent, FC, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from 'firebase.config';

const Contact: FC = () => {
  const [message, setMessage] = useState('');
  const [landlord, setLandlord] = useState<DocumentData | null>(null);
  const [searchParams] = useSearchParams();
  const params = useParams();

  useEffect(() => {
    const getLandlord = async () => {
      const docRef = doc(db, 'users', params.landLordId!);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        setLandlord(docSnapshot.data());
      } else {
        toast.error('Could not get landlord data');
      }
    };

    getLandlord();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.landLordId]);

  const onChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    setMessage(e.target.value);

  return (
    <div className="pageContainer">
      <header className="pageHeader">
        <p>Contact Landlord</p>
      </header>
      {landlord !== null && (
        <main>
          <div className="contactLandlord">
            <p className="landlordName">Contact to {landlord?.name}</p>
          </div>
          <form className="messageForm">
            <div className="messageDiv">
              <label htmlFor="message" className="messageLabel">
                Message
              </label>
              <textarea
                name="message"
                id="message"
                className="textarea"
                value={message}
                onChange={onChange}
              />
            </div>
            <a
              href={`mailto:${landlord.email}?Subject=${searchParams.get(
                'listingName'
              )}&body=${message}`}
            >
              <button type="button" className="primaryButton">
                Send Mesaage
              </button>
            </a>
          </form>
        </main>
      )}
    </div>
  );
};

export default Contact;
