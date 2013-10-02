from django.contrib import admin
from h1ds.models import H1DSSignal, H1DSSignalInstance, Worksheet, Shot
from h1ds.models import UserSignal, Node, Filter, FilterDtype, FilterDim, Device


class DeviceAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}


admin.site.register(Device, DeviceAdmin)


class H1DSSignalAdmin(admin.ModelAdmin):
    pass


admin.site.register(H1DSSignal, H1DSSignalAdmin)


class H1DSSignalInstanceAdmin(admin.ModelAdmin):
    pass


admin.site.register(H1DSSignalInstance, H1DSSignalInstanceAdmin)


class WorksheetAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}


admin.site.register(Worksheet, WorksheetAdmin)


class UserSignalAdmin(admin.ModelAdmin):
    pass


admin.site.register(UserSignal, UserSignalAdmin)


class NodeAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("path",)}


admin.site.register(Node, NodeAdmin)


class FilterAdmin(admin.ModelAdmin):
    prepopulated_fields = {"slug": ("name",)}


admin.site.register(Filter, FilterAdmin)


class FilterDtypeAdmin(admin.ModelAdmin):
    pass


admin.site.register(FilterDtype, FilterDtypeAdmin)


class FilterDimAdmin(admin.ModelAdmin):
    pass


admin.site.register(FilterDim, FilterDimAdmin)


class ShotAdmin(admin.ModelAdmin):
    actions = ['delete_selected']


admin.site.register(Shot, ShotAdmin)
