import { EditFaculty, FacultyJSON } from '#types/faculty'
import { createApp, onMounted, ref } from 'vue'
import { toISO8601DateString } from '../utils/date.js'
import { StatusCodes } from 'http-status-codes'
import { toStructuredErrors } from '../utils/form.js'
import toastr from 'toastr'
createApp({
  compilerOptions: {
    delimiters: ['${', '}'],
  },
  setup() {
    const INITIAL_FORM = {
      id: 0,
      givenName: '',
      middleName: '',
      surname: '',
      gender: '',
      dateOfBirth: new Date(),
      TIN: '',
      positionId: 0,
      employmentStatus: '',
      fundSourceId: 0,
      educations: [],
      email: '',
      image: '',
      mobileNumber: '',
      password: '',
      departmentId: 0,
    }
    const form = ref<EditFaculty>({ ...INITIAL_FORM })
    const isSubmitting = ref(false)
    const facultyImage = ref<File | null>(null)
    const yearNow = new Date().getFullYear()
    const maxDate = new Date()
    maxDate.setFullYear(yearNow + 1, 0, 0)
    onMounted(() => {
      const data = window.viewData.faculty as FacultyJSON
      const assetBaseUrl = window.viewData.assetBaseUrl
      form.value = {
        id: data.id,
        givenName: data.givenName,
        middleName: data.middleName,
        surname: data.surname,
        dateOfBirth: new Date(data.dateOfBirth),
        educations: data.educations,
        email: data.loginCredential.email,
        employmentStatus: data.employmentStatus,
        fundSourceId: data.fundSourceId,
        gender: data.gender,
        mobileNumber: data.mobileNumber,
        positionId: data.positionId,
        image: `${assetBaseUrl}${data.image}`,
        tin: data.tin,
        password: '',
        departmentId: data.departmentId,
      }
    })
    const errors = ref({})
    const addEducation = () => {
      form.value.educations.push({
        almaMater: '',
        educationalAttainmentId: 0,
      })
    }
    const removeEducationByIndex = (index: number) => {
      form.value.educations = form.value.educations.filter((_, idx) => idx !== index)
    }
    const handleDateOfBirth = (event: Event) => {
      const input = event.target as HTMLInputElement
      form.value.dateOfBirth = new Date(input.value)
    }
    const handleImageSelection = (event: Event) => {
      const input = event.target as HTMLInputElement
      if (input.files) {
        facultyImage.value = input.files[0]
        form.value.image = URL.createObjectURL(input.files?.[0])
      }
    }
    const uploadImage = async (facultyId: number) => {
      try {
        if (!facultyImage.value || !facultyId) {
          return
        }
        const formData = new FormData()
        formData.append('facultyId', facultyId.toString())
        formData.append('image', facultyImage.value)
        await fetch('/admin/faculties/images', {
          method: 'POST',
          body: formData,
        })
      } catch (error) {
        console.error(error)
      }
    }
    const clearErrors = () => {
      errors.value = {}
    }
    const submit = async () => {
      clearErrors()
      isSubmitting.value = true
      const response = await fetch(`/admin/faculties/${form.value.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...form.value,
          dateOfBirth: toISO8601DateString(form.value.dateOfBirth),
        }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      })
      const responseBody = await response.json()
      if (response.status === StatusCodes.OK) {
        await uploadImage(form.value.id)
        toastr.success('Faculty updated.')
      }
      if (response.status === StatusCodes.BAD_REQUEST) {
        if (responseBody?.errors) {
          errors.value = toStructuredErrors(responseBody.errors)
        }
      }
      if (response.status > StatusCodes.BAD_REQUEST) {
        toastr.error('Unknown error occured.')
      }
      isSubmitting.value = false
    }

    return {
      form,
      errors,
      addEducation,
      removeEducationByIndex,
      handleDateOfBirth,
      toISO8601DateString,
      handleImageSelection,
      submit,
      maxDate,
      isSubmitting,
    }
  },
}).mount('#editFacultyPage')
