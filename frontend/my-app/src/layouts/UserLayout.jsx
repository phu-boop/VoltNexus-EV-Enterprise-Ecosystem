import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const UserLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="flex-1 p-6 bg-gray-50">
                <Outlet/>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default UserLayout;