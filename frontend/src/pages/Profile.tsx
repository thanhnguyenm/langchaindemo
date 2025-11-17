import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Save, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  MapPin,
  CreditCard,
  Truck
} from 'lucide-react';
import { useAuth, Address } from '@/lib/auth';
import Footer from '@/components/Footer';

const countries = [
  'United States',
  'Canada',
  'United Kingdom',
  'Australia',
  'Germany',
  'France',
  'Italy',
  'Spain',
  'Netherlands',
  'Belgium',
  'Switzerland',
  'Austria',
  'Sweden',
  'Norway',
  'Denmark',
  'Finland',
  'Japan',
  'South Korea',
  'Singapore',
  'Hong Kong',
  'New Zealand',
  'Ireland',
  'Portugal',
  'Greece',
  'Poland',
  'Czech Republic',
  'Hungary',
  'Slovenia',
  'Slovakia',
  'Estonia',
  'Latvia',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Cyprus',
  'Iceland',
  'Liechtenstein',
  'Monaco',
  'San Marino',
  'Vatican City',
  'Andorra'
];

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Address form states
  const [shippingAddress, setShippingAddress] = useState<Address>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: user?.phone || ''
  });

  const [billingAddress, setBillingAddress] = useState<Address>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: user?.phone || ''
  });

  const [sameAsShipping, setSameAsShipping] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const fullName = `${profileForm.firstName} ${profileForm.lastName}`.trim();
      updateProfile({
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        phone: profileForm.phone
      });

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match.' });
      setIsLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      setIsLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save addresses to localStorage or send to API
      localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
      localStorage.setItem('billingAddress', JSON.stringify(sameAsShipping ? shippingAddress : billingAddress));
      
      setMessage({ type: 'success', text: 'Addresses updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update addresses. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileInputChange = (field: string, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleShippingAddressChange = (field: keyof Address, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
    if (sameAsShipping) {
      setBillingAddress(prev => ({ ...prev, [field]: value }));
    }
    setMessage(null);
  };

  const handleBillingAddressChange = (field: keyof Address, value: string) => {
    setBillingAddress(prev => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleSameAsShippingChange = (checked: boolean) => {
    setSameAsShipping(checked);
    if (checked) {
      setBillingAddress({ ...shippingAddress });
    }
  };

  // Load saved addresses on component mount
  useState(() => {
    const savedShipping = localStorage.getItem('shippingAddress');
    const savedBilling = localStorage.getItem('billingAddress');
    
    if (savedShipping) {
      setShippingAddress(JSON.parse(savedShipping));
    }
    if (savedBilling) {
      setBillingAddress(JSON.parse(savedBilling));
    }
  });

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
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>
        </div>

        {/* Alert Messages */}
        {message && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Addresses
              </TabsTrigger>
              <TabsTrigger value="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </TabsTrigger>
            </TabsList>

            {/* Profile Information Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={profileForm.firstName}
                          onChange={(e) => handleProfileInputChange('firstName', e.target.value)}
                          placeholder="Enter your first name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={profileForm.lastName}
                          onChange={(e) => handleProfileInputChange('lastName', e.target.value)}
                          placeholder="Enter your last name"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => handleProfileInputChange('email', e.target.value)}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => handleProfileInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <form onSubmit={handleAddressSubmit} className="space-y-6">
                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Shipping Address
                    </CardTitle>
                    <CardDescription>
                      Where should we deliver your orders?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="shippingFirstName">First Name</Label>
                      <Input
                        id="shippingFirstName"
                        value={shippingAddress.firstName}
                        onChange={(e) => handleShippingAddressChange('firstName', e.target.value)}
                        placeholder="Enter first name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shippingLastName">Last Name</Label>
                      <Input
                        id="shippingLastName"
                        value={shippingAddress.lastName}
                        onChange={(e) => handleShippingAddressChange('lastName', e.target.value)}
                        placeholder="Enter last name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shippingAddress1">Address Line 1</Label>
                      <Input
                        id="shippingAddress1"
                        value={shippingAddress.address1}
                        onChange={(e) => handleShippingAddressChange('address1', e.target.value)}
                        placeholder="Street address, P.O. box, company name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shippingAddress2">Address Line 2 (Optional)</Label>
                      <Input
                        id="shippingAddress2"
                        value={shippingAddress.address2}
                        onChange={(e) => handleShippingAddressChange('address2', e.target.value)}
                        placeholder="Apartment, suite, unit, building, floor, etc."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shippingCity">City</Label>
                        <Input
                          id="shippingCity"
                          value={shippingAddress.city}
                          onChange={(e) => handleShippingAddressChange('city', e.target.value)}
                          placeholder="City"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingState">State</Label>
                        <Input
                          id="shippingState"
                          value={shippingAddress.state}
                          onChange={(e) => handleShippingAddressChange('state', e.target.value)}
                          placeholder="State"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingZip">ZIP Code</Label>
                        <Input
                          id="shippingZip"
                          value={shippingAddress.zipCode}
                          onChange={(e) => handleShippingAddressChange('zipCode', e.target.value)}
                          placeholder="ZIP Code"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shippingCountry">Country</Label>
                        <Select
                          value={shippingAddress.country}
                          onValueChange={(value) => handleShippingAddressChange('country', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((country) => (
                              <SelectItem key={country} value={country}>
                                {country}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shippingPhone">Phone Number</Label>
                        <Input
                          id="shippingPhone"
                          type="tel"
                          value={shippingAddress.phone}
                          onChange={(e) => handleShippingAddressChange('phone', e.target.value)}
                          placeholder="Phone number for delivery"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Billing Address
                    </CardTitle>
                    <CardDescription>
                      Address for billing and invoices
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sameAsShipping"
                        checked={sameAsShipping}
                        onCheckedChange={handleSameAsShippingChange}
                      />
                      <Label htmlFor="sameAsShipping">Same as shipping address</Label>
                    </div>

                    {!sameAsShipping && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="billingFirstName">First Name</Label>
                          <Input
                            id="billingFirstName"
                            value={billingAddress.firstName}
                            onChange={(e) => handleBillingAddressChange('firstName', e.target.value)}
                            placeholder="Enter first name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="billingLastName">Last Name</Label>
                          <Input
                            id="billingLastName"
                            value={billingAddress.lastName}
                            onChange={(e) => handleBillingAddressChange('lastName', e.target.value)}
                            placeholder="Enter last name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="billingAddress1">Address Line 1</Label>
                          <Input
                            id="billingAddress1"
                            value={billingAddress.address1}
                            onChange={(e) => handleBillingAddressChange('address1', e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="billingAddress2">Address Line 2 (Optional)</Label>
                          <Input
                            id="billingAddress2"
                            value={billingAddress.address2}
                            onChange={(e) => handleBillingAddressChange('address2', e.target.value)}
                            placeholder="Street address, P.O. box, company name"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="billingCity">City</Label>
                            <Input
                              id="billingCity"
                              value={billingAddress.city}
                              onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                              placeholder="City"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="billingState">State</Label>
                            <Input
                              id="billingState"
                              value={billingAddress.state}
                              onChange={(e) => handleBillingAddressChange('state', e.target.value)}
                              placeholder="State"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="billingZip">ZIP Code</Label>
                            <Input
                              id="billingZip"
                              value={billingAddress.zipCode}
                              onChange={(e) => handleBillingAddressChange('zipCode', e.target.value)}
                              placeholder="ZIP Code"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="billingCountry">Country</Label>
                            <Select
                              value={billingAddress.country}
                              onValueChange={(value) => handleBillingAddressChange('country', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem key={country} value={country}>
                                    {country}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="billingPhone">Phone Number</Label>
                            <Input
                              id="billingPhone"
                              type="tel"
                              value={billingAddress.phone}
                              onChange={(e) => handleBillingAddressChange('phone', e.target.value)}
                              placeholder="Phone number"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isLoading ? 'Saving...' : 'Save Addresses'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Change Password Tab */}
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                        placeholder="Enter your current password"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                        placeholder="Enter your new password"
                        required
                        minLength={6}
                      />
                      <p className="text-sm text-gray-500">
                        Password must be at least 6 characters long
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your new password"
                        required
                        minLength={6}
                      />
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        <Lock className="h-4 w-4" />
                        {isLoading ? 'Changing...' : 'Change Password'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}