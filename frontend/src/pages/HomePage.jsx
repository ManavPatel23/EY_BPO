import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Brain, Calendar, MessageSquare, PieChart, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/reusableComp/Layout";
import { Sidebar } from "@/Sidebar";
export default function Home() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/support");
  };
  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-1  2 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate__animated animate__fadeIn animate__delay-1s">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Welcome to CallbackAI</span>
            <span className="block text-purple-600">
              Intelligent Claims Management
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Streamline your claims processing with AI-powered scheduling,
            sentiment analysis, and automated follow-ups.
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
            <h2 className="sr-only">A better way to manage claims</h2>
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
                Our AI-powered solution has transformed claims management for
                businesses of all sizes.
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
              <span className="block">Start using CallbackAI today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-purple-200">
              Join the growing number of companies that are streamlining their
              operations and improving customer satisfaction with our AI-powered
              solution.
            </p>
            <Button className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 sm:w-auto transition-transform transform hover:scale-105">
              Sign up for free trial
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const features = [
  {
    name: "AI-Powered Scheduling",
    description:
      "Our intelligent system automatically prioritizes and schedules callbacks based on claim urgency and complexity.",
    icon: Calendar,
  },
  {
    name: "Sentiment Analysis",
    description:
      "Real-time analysis of client interactions helps agents provide more empathetic and effective support.",
    icon: PieChart,
  },
  {
    name: "Automated Follow-ups",
    description:
      "Never miss a follow-up with our AI-driven system that ensures timely communication at every stage of the claims process.",
    icon: Zap,
  },
  {
    name: "Smart Knowledge Base",
    description:
      "Agents have instant access to relevant information, powered by our AI that understands the context of each claim.",
    icon: Brain,
  },
  {
    name: "Streamlined Workflow",
    description:
      "Our intuitive interface combines all necessary tools in one place, significantly reducing processing time and errors.",
    icon: Zap,
  },
  {
    name: "Enhanced Client Experience",
    description:
      "By optimizing every interaction, we help you provide a smoother, more satisfying experience for your clients.",
    icon: MessageSquare,
  },
];

const stats = [
  { label: "Claims Processed", value: "500K+" },
  { label: "Customer Satisfaction", value: "98%" },
  { label: "Claims Completed", value: "85%" },
];
