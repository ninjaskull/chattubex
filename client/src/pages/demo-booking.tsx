import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Calendar as CalendarIcon,
  Clock,
  User,
  Mail,
  Building2,
  Phone,
  MessageSquare,
  ArrowRight,
  Check,
  Sparkles,
  Users,
  Video,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import fallOwlLogo from "@assets/FallOwl_logo_1759280190715.png";
import { format } from "date-fns";

const bookingSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  company: z.string().min(2, "Company name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  teamSize: z.string().min(1, "Please select team size"),
  message: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
];

const teamSizes = [
  "1-10 employees",
  "11-50 employees", 
  "51-200 employees",
  "201-500 employees",
  "500+ employees"
];

export default function DemoBooking() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: "",
      email: "",
      company: "",
      phone: "",
      teamSize: "",
      message: ""
    }
  });

  const teamSize = watch("teamSize");

  const onSubmit = (data: BookingFormData) => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time for your demo",
        variant: "destructive"
      });
      return;
    }

    console.log("Demo booking:", { ...data, date: selectedDate, time: selectedTime });
    
    setIsSubmitted(true);
    toast({
      title: "Demo Scheduled!",
      description: `We'll send a confirmation email to ${data.email}`,
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-12 h-12 text-purple-600" />
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">Demo Scheduled!</h1>
          <p className="text-xl text-purple-100 mb-2">
            {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")} at {selectedTime}
          </p>
          <p className="text-lg text-purple-200 mb-8">
            Check your email for calendar invite and meeting details
          </p>
          <Button
            size="lg"
            className="bg-white text-purple-700 hover:bg-purple-50"
            onClick={() => setLocation("/")}
            data-testid="button-back-home"
          >
            Back to Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      {/* Header */}
      <nav className="relative top-4 px-4 md:px-6 lg:px-8 mb-8">
        <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg shadow-slate-900/5">
          <div className="px-4 md:px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/")}
                  className="text-slate-700 hover:text-purple-600"
                  data-testid="button-back"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <img 
                  src={fallOwlLogo} 
                  alt="FallOwl" 
                  className="h-10 w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-12 items-start"
        >
          {/* Left Side - Info */}
          <motion.div variants={itemVariants} className="lg:sticky lg:top-8">
            <div className="space-y-6">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                    <span className="text-slate-900">Schedule Your</span>
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-800">
                      Personal Demo
                    </span>
                  </h1>
                  <p className="text-xl text-slate-600 mb-8">
                    See how FallOwl can transform your team's communication in just 30 minutes
                  </p>
                </motion.div>
              </div>

              {/* Benefits */}
              <motion.div
                variants={itemVariants}
                className="space-y-4"
              >
                {[
                  {
                    icon: Video,
                    title: "Live Product Demo",
                    desc: "See FallOwl in action with a personalized walkthrough"
                  },
                  {
                    icon: Users,
                    title: "Expert Consultation",
                    desc: "Get answers from our product specialists"
                  },
                  {
                    icon: Sparkles,
                    title: "Custom Solutions",
                    desc: "Discover how FallOwl fits your specific needs"
                  }
                ].map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-slate-900 mb-1">{benefit.title}</h3>
                        <p className="text-sm text-slate-600">{benefit.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200"
              >
                <p className="text-sm text-purple-900 font-medium mb-3">Trusted by leading teams</p>
                <div className="flex items-center gap-6 text-purple-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold">10M+</div>
                    <div className="text-xs">Calls Made</div>
                  </div>
                  <div className="h-10 w-px bg-purple-300" />
                  <div className="text-center">
                    <div className="text-2xl font-bold">99.9%</div>
                    <div className="text-xs">Uptime</div>
                  </div>
                  <div className="h-10 w-px bg-purple-300" />
                  <div className="text-center">
                    <div className="text-2xl font-bold">4.9/5</div>
                    <div className="text-xs">Rating</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Booking Form */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white border-gray-200 shadow-2xl">
              <CardHeader className="border-b border-gray-100 pb-6">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-purple-600" />
                  Book Your Demo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Step Indicator */}
                  <div className="flex items-center gap-2 mb-8">
                    {[1, 2].map((s) => (
                      <div key={s} className="flex items-center flex-1">
                        <motion.div
                          animate={{
                            backgroundColor: step >= s ? "#7c3aed" : "#e5e7eb",
                            scale: step === s ? 1.1 : 1
                          }}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        >
                          {s}
                        </motion.div>
                        {s < 2 && (
                          <motion.div
                            animate={{
                              backgroundColor: step > s ? "#7c3aed" : "#e5e7eb"
                            }}
                            className="flex-1 h-1 mx-2"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Date & Time</h3>
                        
                        {/* Calendar */}
                        <div className="flex justify-center p-4 bg-slate-50 rounded-xl">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date() || date.getDay() === 0 || date.getDay() === 6}
                            className="rounded-md border-0"
                            data-testid="calendar-demo"
                          />
                        </div>

                        {/* Time Slots */}
                        {selectedDate && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="space-y-3"
                          >
                            <Label className="text-sm font-medium flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Select Time (EST)
                            </Label>
                            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto p-2">
                              {timeSlots.map((time) => (
                                <Button
                                  key={time}
                                  type="button"
                                  variant={selectedTime === time ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setSelectedTime(time)}
                                  className={`${
                                    selectedTime === time
                                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                                      : "border-gray-300 hover:border-purple-600"
                                  } transition-all`}
                                  data-testid={`time-${time}`}
                                >
                                  {time}
                                </Button>
                              ))}
                            </div>
                          </motion.div>
                        )}

                        <Button
                          type="button"
                          size="lg"
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => {
                            if (selectedDate && selectedTime) {
                              setStep(2);
                            } else {
                              toast({
                                title: "Please select date and time",
                                variant: "destructive"
                              });
                            }
                          }}
                          data-testid="button-next-step"
                        >
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-slate-900">Your Information</h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setStep(1)}
                            data-testid="button-back-step"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Back
                          </Button>
                        </div>

                        {/* Selected Date/Time Display */}
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                          <div className="flex items-center gap-3 text-purple-900">
                            <CalendarIcon className="w-5 h-5" />
                            <div className="font-medium">
                              {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")} at {selectedTime}
                            </div>
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="fullName" className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4" />
                              Full Name
                            </Label>
                            <Input
                              id="fullName"
                              {...register("fullName")}
                              placeholder="John Smith"
                              className={errors.fullName ? "border-red-500" : ""}
                              data-testid="input-fullname"
                            />
                            {errors.fullName && (
                              <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                              <Mail className="w-4 h-4" />
                              Email Address
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              {...register("email")}
                              placeholder="john@company.com"
                              className={errors.email ? "border-red-500" : ""}
                              data-testid="input-email"
                            />
                            {errors.email && (
                              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="company" className="flex items-center gap-2 mb-2">
                              <Building2 className="w-4 h-4" />
                              Company Name
                            </Label>
                            <Input
                              id="company"
                              {...register("company")}
                              placeholder="Acme Inc."
                              className={errors.company ? "border-red-500" : ""}
                              data-testid="input-company"
                            />
                            {errors.company && (
                              <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                              <Phone className="w-4 h-4" />
                              Phone Number
                            </Label>
                            <Input
                              id="phone"
                              {...register("phone")}
                              placeholder="+1 (555) 123-4567"
                              className={errors.phone ? "border-red-500" : ""}
                              data-testid="input-phone"
                            />
                            {errors.phone && (
                              <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="teamSize" className="flex items-center gap-2 mb-2">
                              <Users className="w-4 h-4" />
                              Team Size
                            </Label>
                            <Select
                              value={teamSize}
                              onValueChange={(value) => setValue("teamSize", value)}
                            >
                              <SelectTrigger className={errors.teamSize ? "border-red-500" : ""} data-testid="select-teamsize">
                                <SelectValue placeholder="Select team size" />
                              </SelectTrigger>
                              <SelectContent>
                                {teamSizes.map((size) => (
                                  <SelectItem key={size} value={size}>
                                    {size}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors.teamSize && (
                              <p className="text-red-500 text-sm mt-1">{errors.teamSize.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="message" className="flex items-center gap-2 mb-2">
                              <MessageSquare className="w-4 h-4" />
                              Additional Notes (Optional)
                            </Label>
                            <Textarea
                              id="message"
                              {...register("message")}
                              placeholder="Tell us about your specific needs or questions..."
                              rows={4}
                              data-testid="input-message"
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          size="lg"
                          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
                          data-testid="button-submit"
                        >
                          Schedule My Demo
                          <Check className="w-4 h-4 ml-2" />
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
