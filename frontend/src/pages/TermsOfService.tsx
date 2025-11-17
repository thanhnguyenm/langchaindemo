import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, FileText, Scale, ShoppingCart, AlertTriangle } from 'lucide-react';
import Footer from '@/components/Footer';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Terms of Service
            </h1>
            <p className="text-gray-600">Last updated: October 5, 2025</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Agreement to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Welcome to our e-commerce platform. These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our website, you agree to be bound by these Terms and our Privacy Policy.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                If you do not agree to these Terms, please do not use our website or services. We reserve the right to modify these Terms at any time, and your continued use constitutes acceptance of any changes.
              </p>
            </CardContent>
          </Card>

          {/* Account Registration */}
          <Card>
            <CardHeader>
              <CardTitle>Account Registration and Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">To access certain features of our website, you may be required to create an account. You agree to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
              <p className="text-gray-700 mt-4">
                We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.
              </p>
            </CardContent>
          </Card>

          {/* Products and Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Products and Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>We strive to provide accurate product descriptions, images, and pricing</li>
                  <li>Colors and appearance may vary due to monitor settings</li>
                  <li>We reserve the right to correct errors and update information</li>
                  <li>Product availability is subject to change without notice</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing and Payment</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>All prices are displayed in USD and include applicable taxes</li>
                  <li>We accept major credit cards and other payment methods as indicated</li>
                  <li>Payment is due at the time of purchase</li>
                  <li>We reserve the right to refuse or cancel orders for any reason</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Orders and Shipping */}
          <Card>
            <CardHeader>
              <CardTitle>Orders and Shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Processing</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Orders are processed within 1-2 business days</li>
                  <li>You will receive order confirmation and tracking information via email</li>
                  <li>We reserve the right to cancel orders due to pricing errors or product unavailability</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping and Delivery</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Shipping costs and delivery times vary by location and method</li>
                  <li>Risk of loss transfers to you upon delivery</li>
                  <li>We are not responsible for delays caused by shipping carriers</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Returns and Refunds */}
          <Card>
            <CardHeader>
              <CardTitle>Returns and Refunds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">We want you to be satisfied with your purchase. Our return policy includes:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>30-day return window from date of delivery</li>
                <li>Items must be in original condition with tags attached</li>
                <li>Customer is responsible for return shipping costs</li>
                <li>Refunds processed within 5-7 business days after receipt</li>
                <li>Certain items may be non-returnable (final sale, personalized items)</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Conduct */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Prohibited Uses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">You agree not to use our website for any unlawful purpose or prohibited activity, including:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Violating any applicable laws or regulations</li>
                <li>Infringing on intellectual property rights</li>
                <li>Transmitting harmful or malicious code</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Harassing or threatening other users</li>
                <li>Creating false accounts or impersonating others</li>
                <li>Engaging in fraudulent activities</li>
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                All content on our website, including text, graphics, logos, images, and software, is our property or licensed to us and is protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-700">
                You may not reproduce, distribute, modify, or create derivative works from our content without our express written permission.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle>Disclaimers and Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Disclaimers</h3>
                <p className="text-gray-700">
                  Our website and services are provided "as is" without warranties of any kind. We disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Limitation of Liability</h3>
                <p className="text-gray-700">
                  To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our website or services.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card>
            <CardHeader>
              <CardTitle>Governing Law and Dispute Resolution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                These Terms are governed by the laws of [Your State/Country]. Any disputes arising from these Terms or your use of our website shall be resolved through binding arbitration or in the courts of [Your Jurisdiction].
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> legal@example.com</p>
                <p><strong>Phone:</strong> +1 (555) 123-4567</p>
                <p><strong>Address:</strong> 123 Legal Street, Terms City, TC 12345</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}