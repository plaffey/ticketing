import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  OrderStatus,
} from '@pltickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();

    // TODO - Would be ideal to create a new 'OrderUpdatedEvent' and publish the event out, eventhough no further
    // action is being taken in the app at this time.  For future, it would perhaps be used by another service.

    msg.ack();
  }
}
