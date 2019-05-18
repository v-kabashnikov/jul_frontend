import React from 'react';
import Cable from 'actioncable';
import { API_WS_ROOT, API_ROOT } from '../constants';

export class Order extends React.Component {
  state = {
    order: {name: ''}
  };

  componentDidMount = () => {
    let cable = Cable.createConsumer(API_WS_ROOT)

    cable.subscriptions.create({
      channel: 'OrdersChannel',
      id: 2
    }, {
      connected: () => {
        console.log('connected')
      },
      received: (data: any) => {
        this.UpdateOrderStatus(data);
      },
      disconnected: () => {
        console.log('disco');
      },
    });
    this.fetchOrderStatus()
  };

  UpdateOrderStatus = (response: any) => {
    this.setState({ order: response });
  };

  fetchOrderStatus = () => {
    fetch(`${API_ROOT}/orders/2`)
      .then(res => res.json())
      .then(order => this.setState({ order }));
  }

  render = () => {
    return (
      <div className="order">
        <h1>{this.state.order.name }</h1>
      </div>
    );
  };
}