import { useContext, useEffect, useRef, useState } from 'react';

import AuthContext from '../../context/auth-context';
import Backdrop from '../../components/Backdrop';
import EventList from '../../components/Event/EventList';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import './index.css';

const EventsPage = () => {
  const authContext = useContext(AuthContext);

  const titleInputRef = useRef();
  const priceInputRef = useRef();
  const dateInputRef = useRef();
  const descriptionTextareaRef = useRef();

  const [creating, setCreating] = useState(false);
  const [events, setEvents] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    let isActive = true;

    const fetchEvents = async () => {
      setLoading(true);

      const requestBody = {
        query: `
          query {
            events {
              _id
              title
              description
              date
              price
              creator {
                _id
                email
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
            'Content-Type': 'application/json',
          },
        });

        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Failed!');
        }

        const resData = await res.json();
        const { events } = resData.data;
        if (isActive) {
          setEvents(events);
        }
      } catch (error) {
        console.log(error);
      }

      if (isActive) {
        setLoading(false);
      }
    };

    fetchEvents();

    return () => {
      isActive = false;
    };
  }, []);

  const modalConfirmHandler = async () => {
    const title = titleInputRef.current.value;
    const price = +priceInputRef.current.value;
    const date = dateInputRef.current.value;
    const description = descriptionTextareaRef.current.value;

    if (
      !title.trim().length ||
      price <= 0 ||
      !date.trim().length ||
      !description.trim().length
    ) {
      return;
    }

    const eventInput = { title, description, price, date };

    const requestBody = {
      query: `
        mutation CreateEvent($eventInput: EventInput!) {
          createEvent(eventInput: $eventInput) {
            _id
            title
            description
            date
            price
          }
        }
      `,
      variables: {
        eventInput,
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

      const resData = await res.json();
      const { createEvent } = resData.data;

      setEvents((prevEvents) => {
        const updatedEvents = [...prevEvents];
        updatedEvents.push({
          _id: createEvent._id,
          title: createEvent.title,
          description: createEvent.description,
          date: createEvent.date,
          price: createEvent.price,
          creator: {
            _id: authContext.userId,
          },
        });
        return updatedEvents;
      });
    } catch (error) {
      console.log(error);
    }

    setCreating(false);
  };

  const modalCancelHandler = () => {
    setCreating(false);
    setSelectedEvent(null);
  };

  const startCreateEventHandler = () => {
    setCreating(true);
  };

  const showDetailHandler = (eventId) => {
    const chosenEvent = events.find((event) => event._id === eventId);
    setSelectedEvent(chosenEvent);
  };

  const bookEventHandler = async () => {
    if (!authContext.token) {
      setSelectedEvent(null);
      return;
    }

    const requestBody = {
      query: `
        mutation BookEvent($id: ID!) {
          bookEvent(eventId: $id) {
            _id
            createdAt
            updatedAt
          }
        }
      `,
      variables: {
        id: selectedEvent._id,
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

      setSelectedEvent(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {(creating || selectedEvent) && (
        <Backdrop onCancel={modalCancelHandler} />
      )}
      {creating && (
        <Modal
          title='Add Event'
          canCancel
          canConfirm
          onCancel={modalCancelHandler}
          onConfirm={modalConfirmHandler}
          confirmText='Confirm'>
          <form>
            <div className='form-control'>
              <label htmlFor='title'>Title</label>
              <input type='text' id='title' ref={titleInputRef} />
            </div>
            <div className='form-control'>
              <label htmlFor='price'>Price</label>
              <input type='number' id='price' ref={priceInputRef} />
            </div>
            <div className='form-control'>
              <label htmlFor='date'>Date</label>
              <input type='datetime-local' id='date' ref={dateInputRef} />
            </div>
            <div className='form-control'>
              <label htmlFor='description'>Description</label>
              <textarea
                id='description'
                rows='4'
                ref={descriptionTextareaRef}
              />
            </div>
          </form>
        </Modal>
      )}
      {selectedEvent && (
        // <Backdrop onCancel={modalCancelHandler} />
        <Modal
          title={selectedEvent.title}
          canCancel
          canConfirm
          onCancel={modalCancelHandler}
          onConfirm={bookEventHandler}
          confirmText={authContext.token ? 'Book' : 'Confirm'}>
          <h1>{selectedEvent.title}</h1>
          <h2>
            ${selectedEvent.price} -{' '}
            {new Date(selectedEvent.date).toLocaleDateString()}
          </h2>
          <p>{selectedEvent.description}</p>
        </Modal>
      )}
      {authContext.token && (
        <div className='events-control'>
          <p>Share your own Events!</p>
          <button className='btn' onClick={startCreateEventHandler}>
            Create Event
          </button>
        </div>
      )}
      {isLoading ? (
        <Spinner />
      ) : (
        <EventList
          events={events}
          authUserId={authContext.userId}
          onViewDetail={showDetailHandler}
        />
      )}
    </>
  );
};

export default EventsPage;
