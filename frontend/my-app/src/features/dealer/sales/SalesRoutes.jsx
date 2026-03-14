import React from 'react';
import { Route, Routes } from 'react-router-dom';

// Lazy load Sales Order pages
const SalesOrderListPage = React.lazy(() =>
  import('./salesOrder/pages/SalesOrderListPage')
);
const SalesOrderDetailPage = React.lazy(() =>
  import('./salesOrder/pages/SalesOrderDetailPage')
);
// const SalesOrderCreatePage = React.lazy(() =>
//   import('./salesOrder/pages/SalesOrderCreatePage')
// );

// Lazy load Order Tracking pages
const OrderTrackingPage = React.lazy(() =>
  import('./orderTracking/pages/OrderTrackingPage')
);
const TrackingHistoryPage = React.lazy(() =>
  import('./orderTracking/pages/TrackingHistoryPage')
);

// Lazy load Order Item pages
const OrderItemListPage = React.lazy(() =>
  import('./orderItem/pages/OrderItemListPage')
);
const OrderItemCreatePage = React.lazy(() =>
  import('./orderItem/pages/OrderItemCreatePage')
);

// Lazy load Sales Contract pages
const ContractListPage = React.lazy(() =>
  import('../sales/salesContract/pages/ContractListPage')
);
const ContractDetailPage = React.lazy(() =>
  import('../sales/salesContract/pages/ContractDetailPage')
);
const ContractCreatePage = React.lazy(() =>
  import('../sales/salesContract/pages/ContractCreatePage')
);
const ContractEditPage = React.lazy(() =>
  import('../sales/salesContract/pages/ContractEditPage')
);

const SalesRoutes = () => {
  return (
    <React.Suspense fallback={<div>Loading sales module...</div>}>
      <Routes>
        {/* Sales Order Routes */}
        <Route path="orders" element={<SalesOrderListPage />} />
        {/* <Route path="orders/create" element={<SalesOrderCreatePage />} /> */}
        <Route path="orders/:orderId" element={<SalesOrderDetailPage />} />

        {/* Order Tracking Routes */}
        <Route path="orders/:orderId/tracking" element={<OrderTrackingPage />} />
        <Route path="orders/:orderId/tracking/history" element={<TrackingHistoryPage />} />

        {/* Order Item Routes */}
        <Route path="orders/:orderId/items" element={<OrderItemListPage />} />
        <Route path="orders/:orderId/items/create" element={<OrderItemCreatePage />} />

        {/* Sales Contract Routes */}
        <Route path="contracts" element={<ContractListPage />} />
        <Route path="contracts/create" element={<ContractCreatePage />} />
        <Route path="contracts/:contractId" element={<ContractDetailPage />} />
        <Route path="contracts/:contractId/edit" element={<ContractEditPage />} />
        <Route path="orders/:orderId/contract/create" element={<ContractCreatePage />} />

        {/* Optional / legacy delivery route */}
        <Route path="delivery" element={<OrderTrackingPage />} />
      </Routes>
    </React.Suspense>
  );
};

export default SalesRoutes;