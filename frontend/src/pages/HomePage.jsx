import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Brain,
  Calendar,
  MessageSquare,
  PieChart,
  Zap,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/reusableComp/Layout";
import { Sidebar } from "@/Sidebar";
export default function Home() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/hosp/login");
  };
  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-1  2 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate__animated animate__fadeIn animate__delay-1s">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Welcome to ClaimSwift</span>
            <span className="block text-purple-600">
              Rapid Claims Processing
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Process claims in 5-10 minutes with advanced fraud detection,
            streamlined workflows, and dedicated customer support.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Button
                onClick={handleClick}
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 md:py-4 md:text-lg md:px-10 transition-transform transform hover:scale-105"
              >
                Get Started
              </Button>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-purple-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-transform transform hover:scale-105"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Feature Section */}
        <div className="py-12 bg-white">
          <div className="max-w-xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            <h2 className="sr-only">Fast and secure claims processing</h2>
            <div className="grid grid-cols-1 gap-y-12 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card
                  key={feature.name}
                  className="pt-6 hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:scale-105 transition-transform"
                >
                  <CardHeader>
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white transform hover:scale-110 transition-all">
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <CardTitle className="mt-6 text-lg font-medium text-gray-900">
                      {feature.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base text-gray-500">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        {/* Statistics Section */}
        <div className="bg-purple-700">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Trusted by companies worldwide
              </h2>
              <p className="mt-3 text-xl text-white sm:mt-4">
                Our rapid claims processing solution has transformed the
                insurance industry with speed, accuracy, and security.
              </p>
            </div>
            <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col">
                  <dt className="order-2 mt-2 text-lg leading-6 font-medium text-purple-200">
                    {stat.label}
                  </dt>
                  <dd className="order-1 text-5xl font-extrabold text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        {/* CTA Section */}
        <div className="bg-purple-700 rounded-lg shadow-xl mt-16 animate__animated animate__fadeIn animate__delay-2s">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">
                Ready to revolutionize your claims process?
              </span>
              <span className="block">Start using ClaimSwift today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-purple-200">
              Join the growing number of companies that process claims in
              minutes instead of days while protecting against fraud and
              improving customer satisfaction.
            </p>
            <Button className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 sm:w-auto transition-transform transform hover:scale-105">
              Sign up now
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const features = [
  {
    name: "Rapid Claims Processing",
    description:
      "Process claims in just 5-10 minutes with our intelligent system that automatically prioritizes and verifies claim information.",
    icon: Calendar,
  },
  {
    name: "Advanced Fraud Detection",
    description:
      "Our AI-powered system identifies potential fraud with high accuracy, protecting your business while ensuring legitimate claims are processed quickly.",
    icon: Shield,
  },
  {
    name: "Real-time Verification",
    description:
      "Instantly verify claim details through our comprehensive database and partnership network, eliminating delays in the processing pipeline.",
    icon: Zap,
  },
  {
    name: "Smart Document Analysis",
    description:
      "Our AI extracts and verifies information from submitted documents in seconds, reducing manual review and accelerating claim approval.",
    icon: Brain,
  },
  {
    name: "Simplified User Interface",
    description:
      "Easy-to-use portals for both customers and claims processors make submitting and reviewing claims intuitive and hassle-free.",
    icon: MessageSquare,
  },
  {
    name: "24/7 Customer Support",
    description:
      "Our dedicated support team is always available to assist with any questions or issues, ensuring a smooth claims experience for everyone.",
    icon: Zap,
  },
];

const stats = [
  { label: "Average Processing Time", value: "7 min" },
  { label: "Fraud Detection Rate", value: "99.7%" },
  { label: "Customer Satisfaction", value: "98%" },
];
