import React, { Suspense } from 'react'
import Navbar from './componets/Navbar'
import Footer from './componets/Footer'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
// import AdminDashboard from './pages/AdminDashboard' // Deprecated
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import UserProfile from './pages/UserProfile'
import UpdatePassword from './pages/UpdatePassword'
import DebugBanner from './componets/DebugBanner'
import ErrorBoundary from './componets/ErrorBoundary'
import Rooms from './pages/Rooms'
import Menu from './pages/Menu'
import Halls from './pages/Halls'

// Lazy load components
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const DashboardHome = React.lazy(() => import('./pages/admin/DashboardHome'));
const HallManagement = React.lazy(() => import('./pages/admin/HallManagement'));
const RoomManagement = React.lazy(() => import('./pages/admin/RoomManagement'));
const StaffManagement = React.lazy(() => import('./pages/admin/StaffManagement'));
const FacilityManagement = React.lazy(() => import('./pages/admin/FacilityManagement'));
const MenuManagement = React.lazy(() => import('./pages/admin/MenuManagement'));
const ReviewManagement = React.lazy(() => import('./pages/admin/ReviewManagement'));
const BookingManagement = React.lazy(() => import('./pages/admin/BookingManagement'));
const BookingPage = React.lazy(() => import('./pages/BookingPage'));
const PaymentPage = React.lazy(() => import('./pages/PaymentPage'));

const App = () => {
  const isOwnerPath = useLocation().pathname.includes("admin");

  return (
    <div>
      <DebugBanner />
      {!isOwnerPath && <Navbar />}
      <div className='min-h-[70vh]'>
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[50vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          }>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/menu' element={<Menu />} />
              <Route path='/halls' element={<Halls />} />
              <Route path='/admin' element={<AdminLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path='bookings' element={<BookingManagement />} />
                <Route path='halls' element={<HallManagement />} />
                <Route path='rooms' element={<RoomManagement />} />
                <Route path='staff' element={<StaffManagement />} />
                <Route path='facilities' element={<FacilityManagement />} />
                <Route path='menu' element={<MenuManagement />} />
                <Route path='reviews' element={<ReviewManagement />} />
              </Route>
              <Route path='/rooms' element={<Rooms />} />
              <Route path='/book/:roomId' element={<BookingPage />} />
              <Route path='/payment' element={<PaymentPage />} />
              <Route path='/sign-in' element={<SignIn />} />
              <Route path='/sign-up' element={<SignUp />} />
              <Route path='/profile' element={<UserProfile />} />
              <Route path='/update-password' element={<UpdatePassword />} />
              {/* Fallback route */}
              <Route path='*' element={
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-500">
                  <h1 className="text-4xl font-bold text-gray-300 mb-2">404</h1>
                  <p>Page Not Found</p>
                </div>
              } />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>
      {!isOwnerPath && <Footer />}
    </div>
  )
}

export default App