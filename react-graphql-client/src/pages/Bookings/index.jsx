import { useContext, useEffect, useState } from 'react';

import AuthContext from '../../context/auth-context';
import BookingChart from '../../components/Booking/BookingChart';
import BookingControls from '../../components/Booking/BookingControls';
import BookingList from '../../components/Booking/BookingList';
import Spinner from '../../components/Spinner';

const BookingsPage = () => {
  const authContext = useContext(AuthContext);

  const [bookings, setBookings] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [outputType, setOutputType] = useState('list');

  useEffect(() => {
    let isActive = true;

    const fetchBookings = async () => {
      setLoading(true);

      const requestBody = {
        query: `
          query {
            bookings {
              _id
              createdAt
              event {
                _id
                title
                date
                price
              }
            }
          }
        `,
      };

      try {
        const res = await fetch('http://localhost:8000/graphql', {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: {
            Authorization: `Bearer ${authContext.token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }

        const resData = await res.json();
        const { bookings } = resData.data;
        if (isActive) {
          setBookings(bookings);
        }
      } catch (error) {
        console.log(error);
      }

      if (isActive) {
        setLoading(false);
      }
    };

    fetchBookings();

    return () => {
      isActive = false;
    };
  }, [authContext.token]);

  const deleteBookingHandler = async (bookingId) => {
    setLoading(true);

    const requestBody = {
      query: `
        mutation CancelBooking($id: ID!) {
          cancelBooking(bookingId: $id) {
            _id
            title
          }
        }
      `,
      variables: {
        id: bookingId,
      },
    };

    try {
      const res = await fetch('http://localhost:8000/graphql', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          Authorization: `Bearer ${authContext.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Failed!');
      }

      setBookings((prevBookings) =>
        prevBookings.filter((booking) => booking._id !== bookingId)
      );
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const changeOutputTypeHandler = (outputType) => {
    if (outputType === 'list') {
      setOutputType('list');
    } else {
      setOutputType('chart');
    }
  };

  let content = <Spinner />;

  if (!isLoading) {
    content = (
      <>
        <BookingControls
          activeOutputType={outputType}
          onChange={changeOutputTypeHandler}
        />
        {outputType === 'list' ? (
          <BookingList bookings={bookings} onDelete={deleteBookingHandler} />
        ) : (
          <BookingChart bookings={bookings} />
        )}
      </>
    );
  }

  return content;
};

export default BookingsPage;
